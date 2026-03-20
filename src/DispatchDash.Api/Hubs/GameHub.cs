namespace DispatchDash.Api.Hubs;

using Microsoft.AspNetCore.SignalR;
using DispatchDash.Api.Models;
using DispatchDash.Api.Services;

public class GameHub : Hub
{
    private readonly GameManager _gameManager;
    private readonly GameTimerService _timerService;

    public GameHub(GameManager gameManager, GameTimerService timerService)
    {
        _gameManager = gameManager;
        _timerService = timerService;
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

        // Send all player names to the whole room
        var game = _gameManager.GetGame(roomCode)!;
        var playerNames = game.Players.Values.Select(p => p.Name).ToList();
        await Clients.Group(roomCode).SendAsync("PlayerJoined", playerNames, game.Players.Count);
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
        _timerService.StartTimer(roomCode, round.TimerSeconds);
    }

    public async Task SubmitSolution(string roomCode, string playerId, List<RouteSubmission> routes)
    {
        var ok = _gameManager.SubmitSolution(roomCode, playerId, routes);
        if (!ok) return;
        var game = _gameManager.GetGame(roomCode)!;
        var name = game.Players.GetValueOrDefault(playerId)?.Name ?? "Unknown";
        await Clients.Group($"{roomCode}-host").SendAsync("SubmissionReceived", name);
        if (_gameManager.AllSubmitted(roomCode))
            await _timerService.EndRound(roomCode);
    }
}
