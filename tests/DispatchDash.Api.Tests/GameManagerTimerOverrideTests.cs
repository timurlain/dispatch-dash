using DispatchDash.Api.Services;

namespace DispatchDash.Api.Tests;

public class GameManagerTimerOverrideTests
{
    private readonly GameManager _sut = new(new ScoringService(), new FeasibilityChecker());

    [Fact]
    public void StartRound_UsesOverrideWhenInRange()
    {
        var code = _sut.CreateGame();
        _sut.JoinGame(code, "Alice", "conn-1");

        var round = _sut.StartRound(code, 75);

        Assert.NotNull(round);
        var state = _sut.GetGame(code)!;
        Assert.Equal(75, state.RoundTimerSeconds);
    }

    [Fact]
    public void StartRound_ClampsBelowMin()
    {
        var code = _sut.CreateGame();
        _sut.JoinGame(code, "Alice", "conn-1");

        var round = _sut.StartRound(code, 10);

        Assert.NotNull(round);
        var state = _sut.GetGame(code)!;
        Assert.Equal(30, state.RoundTimerSeconds);
    }

    [Fact]
    public void StartRound_ClampsAboveMax()
    {
        var code = _sut.CreateGame();
        _sut.JoinGame(code, "Alice", "conn-1");

        var round = _sut.StartRound(code, 600);

        Assert.NotNull(round);
        var state = _sut.GetGame(code)!;
        Assert.Equal(300, state.RoundTimerSeconds);
    }

    [Fact]
    public void StartRound_NullFallsBackToDefault()
    {
        var code = _sut.CreateGame();
        _sut.JoinGame(code, "Alice", "conn-1");

        var round = _sut.StartRound(code, null);

        Assert.NotNull(round);
        Assert.Equal(1, round.RoundNumber);
        var state = _sut.GetGame(code)!;
        Assert.Equal(60, state.RoundTimerSeconds);
    }
}
