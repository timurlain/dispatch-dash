using DispatchDash.Api.Models;
using DispatchDash.Api.Services;

namespace DispatchDash.Api.Tests;

public class GameManagerTests
{
    private readonly GameManager _sut = new(new ScoringService(), new FeasibilityChecker());

    [Fact]
    public void CreateGame_Returns4LetterCode()
    {
        var code = _sut.CreateGame();
        Assert.Equal(4, code.Length);
        Assert.Matches("^[A-Z]{4}$", code);
    }

    [Fact]
    public void CreateGame_CodesAreUnique()
    {
        var codes = Enumerable.Range(0, 10).Select(_ => _sut.CreateGame()).ToList();
        Assert.Equal(codes.Count, codes.Distinct().Count());
    }

    [Fact]
    public void JoinGame_AddsPlayer()
    {
        var code = _sut.CreateGame();
        var player = _sut.JoinGame(code, "Alice", "conn-1");
        Assert.NotNull(player);
        Assert.Equal("Alice", player.Name);
    }

    [Fact]
    public void JoinGame_InvalidCode_ReturnsNull()
    {
        var player = _sut.JoinGame("ZZZZ", "Alice", "conn-1");
        Assert.Null(player);
    }

    [Fact]
    public void StartRound_SetsPhaseToPlaying()
    {
        var code = _sut.CreateGame();
        _sut.JoinGame(code, "Alice", "conn-1");
        var round = _sut.StartRound(code);
        Assert.NotNull(round);
        Assert.Equal(1, round.RoundNumber);
        var state = _sut.GetGame(code);
        Assert.Equal(GamePhase.Playing, state!.Phase);
    }

    [Fact]
    public void SubmitSolution_StoresSubmission()
    {
        var code = _sut.CreateGame();
        var player = _sut.JoinGame(code, "Alice", "conn-1")!;
        _sut.StartRound(code);

        var routes = new List<RouteSubmission> { new("V1", ["A", "B", "C"]) };
        var ok = _sut.SubmitSolution(code, player.Id, routes);

        Assert.True(ok);
    }

    [Fact]
    public void EndRound_ScoresAndRanks()
    {
        var code = _sut.CreateGame();
        var alice = _sut.JoinGame(code, "Alice", "conn-1")!;
        var bob = _sut.JoinGame(code, "Bob", "conn-2")!;
        _sut.StartRound(code);

        var round = _sut.GetCurrentRound(code)!;
        var allIds = round.Customers.Select(c => c.Id).ToList();
        // Alice visits all (no penalty); Bob visits only 1 (14 unvisited × 200 = 2800 penalty)
        _sut.SubmitSolution(code, alice.Id, [new("V1", allIds)]);
        _sut.SubmitSolution(code, bob.Id, [new("V1", allIds.Take(1).ToList())]);

        var results = _sut.EndRound(code);

        Assert.Equal(2, results.Count);
        Assert.True(results.All(r => r.Score.HasValue));
        Assert.True(results.All(r => r.Rank.HasValue));
        // Both players have scores and ranks assigned
        Assert.NotEqual(results[0].Score, results[1].Score);
    }

    [Fact]
    public void GetLeaderboard_ReturnsGrandTotal()
    {
        var code = _sut.CreateGame();
        var alice = _sut.JoinGame(code, "Alice", "conn-1")!;
        _sut.StartRound(code);

        var round = _sut.GetCurrentRound(code)!;
        _sut.SubmitSolution(code, alice.Id, [new("V1", round.Customers.Select(c => c.Id).ToList())]);
        _sut.EndRound(code);

        var leaderboard = _sut.GetLeaderboard(code);
        Assert.Single(leaderboard);
        Assert.True(leaderboard[0].TotalScore > 0);
    }
}
