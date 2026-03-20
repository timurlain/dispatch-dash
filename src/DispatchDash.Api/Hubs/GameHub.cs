namespace DispatchDash.Api.Hubs;

using Microsoft.AspNetCore.SignalR;
using DispatchDash.Api.Models;
using DispatchDash.Api.Services;

public class GameHub : Hub
{
    private readonly GameManager _gameManager;

    public GameHub(GameManager gameManager)
    {
        _gameManager = gameManager;
    }

    public async Task JoinGame(string roomCode, string playerName)
    {
        var player = _gameManager.JoinGame(roomCode, playerName, Context.ConnectionId);
        if (player is null)
        {
            await Clients.Caller.SendAsync("Error", "Invalid room code");
            return;
        }
        await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);
        await Clients.Caller.SendAsync("Joined", player.Id, player.Name);
        await Clients.Group(roomCode).SendAsync("PlayerJoined", player.Name,
            _gameManager.GetGame(roomCode)!.Players.Count);
    }

    public async Task JoinAsHost(string roomCode)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"{roomCode}-host");
        await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);
    }

    public async Task StartRound(string roomCode)
    {
        var round = _gameManager.StartRound(roomCode);
        if (round is null) return;
        await Clients.Group(roomCode).SendAsync("RoundStarting", round, 3);
        _ = RunTimer(roomCode, round.TimerSeconds);
    }

    public async Task SubmitSolution(string roomCode, string playerId, List<RouteSubmission> routes)
    {
        var ok = _gameManager.SubmitSolution(roomCode, playerId, routes);
        if (!ok) return;
        var game = _gameManager.GetGame(roomCode)!;
        var playerName = game.Players.GetValueOrDefault(playerId)?.Name ?? "Unknown";
        await Clients.Group($"{roomCode}-host").SendAsync("SubmissionReceived", playerName);
        if (_gameManager.AllSubmitted(roomCode))
            await EndRound(roomCode);
    }

    private async Task EndRound(string roomCode)
    {
        var results = _gameManager.EndRound(roomCode);
        var leaderboard = _gameManager.GetLeaderboard(roomCode);
        var game = _gameManager.GetGame(roomCode)!;
        await Clients.Group(roomCode).SendAsync("RoundEnded", results);
        await Clients.Group($"{roomCode}-host").SendAsync("LeaderboardUpdate", leaderboard);
        if (game.Phase == GamePhase.GameOver)
        {
            var feasibility = _gameManager.AnalyzeRound(3);
            await Clients.Group(roomCode).SendAsync("GameOver", leaderboard, feasibility);
        }
    }

    private async Task RunTimer(string roomCode, int totalSeconds)
    {
        await Task.Delay(3000); // countdown delay
        for (int remaining = totalSeconds; remaining >= 0; remaining--)
        {
            var game = _gameManager.GetGame(roomCode);
            if (game?.Phase != GamePhase.Playing) return;
            if (remaining <= 15 || remaining % 10 == 0)
                await Clients.Group(roomCode).SendAsync("TimerTick", remaining);
            await Task.Delay(1000);
        }
        var g = _gameManager.GetGame(roomCode);
        if (g?.Phase == GamePhase.Playing)
            await EndRound(roomCode);
    }
}
