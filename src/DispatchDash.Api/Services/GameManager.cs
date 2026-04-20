namespace DispatchDash.Api.Services;

using System.Collections.Concurrent;
using DispatchDash.Api.Data;
using DispatchDash.Api.Models;

public record LeaderboardEntry(string PlayerId, string PlayerName, double TotalScore, int Rank);

public class GameManager
{
    private readonly ConcurrentDictionary<string, GameState> _games = new();
    private readonly ScoringService _scoring;
    private readonly FeasibilityChecker _feasibility;
    private static readonly Random _random = new();

    public GameManager(ScoringService scoring, FeasibilityChecker feasibility)
    {
        _scoring = scoring;
        _feasibility = feasibility;
    }

    public string CreateGame()
    {
        string code;
        do
        {
            code = new string(Enumerable.Range(0, 4)
                .Select(_ => (char)('A' + _random.Next(26))).ToArray());
        } while (!_games.TryAdd(code, new GameState { RoomCode = code }));
        return code;
    }

    public GameState? GetGame(string roomCode) =>
        _games.GetValueOrDefault(roomCode);

    public Player? JoinGame(string roomCode, string name, string connectionId)
    {
        if (!_games.TryGetValue(roomCode, out var game)) return null;
        var player = new Player(Guid.NewGuid().ToString("N")[..8], name, connectionId);
        game.Players[player.Id] = player;
        return player;
    }

    public RoundConfig? StartRound(string roomCode, int? timerOverride = null)
    {
        if (!_games.TryGetValue(roomCode, out var game)) return null;
        game.CurrentRound++;
        if (game.CurrentRound > 3) return null;
        var round = RoundDefinitions.GetRound(game.CurrentRound);
        var effectiveSeconds = timerOverride.HasValue
            ? Math.Clamp(timerOverride.Value, 30, 300)
            : round.TimerSeconds;
        game.Phase = GamePhase.Playing;
        game.RoundStartedAt = DateTime.UtcNow;
        game.RoundTimerSeconds = effectiveSeconds;
        game.Submissions[game.CurrentRound] = [];
        return round;
    }

    public RoundConfig? GetCurrentRound(string roomCode)
    {
        if (!_games.TryGetValue(roomCode, out var game)) return null;
        if (game.CurrentRound < 1 || game.CurrentRound > 3) return null;
        return RoundDefinitions.GetRound(game.CurrentRound);
    }

    public bool SubmitSolution(string roomCode, string playerId, List<RouteSubmission> routes)
    {
        if (!_games.TryGetValue(roomCode, out var game)) return false;
        if (game.Phase != GamePhase.Playing) return false;
        if (!game.Players.ContainsKey(playerId)) return false;
        if (!game.Submissions.ContainsKey(game.CurrentRound)) return false;
        var subs = game.Submissions[game.CurrentRound];
        if (subs.Any(s => s.PlayerId == playerId)) return false;
        subs.Add(new Submission(playerId, game.CurrentRound, routes));
        return true;
    }

    public List<Submission> EndRound(string roomCode)
    {
        if (!_games.TryGetValue(roomCode, out var game)) return [];
        if (!game.Submissions.ContainsKey(game.CurrentRound)) return [];
        var round = RoundDefinitions.GetRound(game.CurrentRound);
        var subs = game.Submissions[game.CurrentRound];

        // Auto-submit empty for non-submitters
        foreach (var player in game.Players.Values)
        {
            if (!subs.Any(s => s.PlayerId == player.Id))
                subs.Add(new Submission(player.Id, game.CurrentRound, []));
        }

        // Score
        for (int i = 0; i < subs.Count; i++)
        {
            var score = _scoring.Score(subs[i].Routes, round);
            subs[i] = subs[i] with
            {
                Score = score.TotalScore,
                DistanceScore = score.DistanceScore,
                PenaltyScore = score.PenaltyScore,
                CapacityPenalty = score.CapacityPenalty,
                TimeWindowPenalty = score.TimeWindowPenalty,
                UnvisitedPenalty = score.UnvisitedPenalty
            };
        }

        // Rank
        var ranked = subs.OrderBy(s => s.Score).ToList();
        for (int i = 0; i < ranked.Count; i++)
        {
            var idx = subs.IndexOf(ranked[i]);
            subs[idx] = subs[idx] with { Rank = i + 1 };
        }

        game.Phase = game.CurrentRound >= 3 ? GamePhase.GameOver : GamePhase.ShowingResults;
        return subs;
    }

    public List<LeaderboardEntry> GetLeaderboard(string roomCode)
    {
        if (!_games.TryGetValue(roomCode, out var game)) return [];
        var totals = game.Players.Values.Select(p =>
        {
            var total = game.Submissions.Values
                .SelectMany(s => s)
                .Where(s => s.PlayerId == p.Id && s.Score.HasValue)
                .Sum(s => s.Score!.Value);
            return new { p.Id, p.Name, Total = total };
        })
        .OrderBy(x => x.Total)
        .ToList();
        return totals.Select((x, i) =>
            new LeaderboardEntry(x.Id, x.Name, x.Total, i + 1)).ToList();
    }

    public FeasibilityResult AnalyzeRound(int roundNumber) =>
        _feasibility.Analyze(RoundDefinitions.GetRound(roundNumber));

    public bool AllSubmitted(string roomCode)
    {
        if (!_games.TryGetValue(roomCode, out var game)) return false;
        if (!game.Submissions.ContainsKey(game.CurrentRound)) return false;
        return game.Submissions[game.CurrentRound].Count >= game.Players.Count;
    }

    public void UpdatePlayerConnection(string roomCode, string playerId, string newConnectionId)
    {
        if (!_games.TryGetValue(roomCode, out var game)) return;
        if (game.Players.TryGetValue(playerId, out var player))
            game.Players[playerId] = player with { ConnectionId = newConnectionId };
    }
}
