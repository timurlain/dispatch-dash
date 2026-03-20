namespace DispatchDash.Api.Services;

using Microsoft.AspNetCore.SignalR;
using DispatchDash.Api.Hubs;
using DispatchDash.Api.Models;

public class GameTimerService
{
    private readonly IHubContext<GameHub> _hubContext;
    private readonly GameManager _gameManager;

    public GameTimerService(IHubContext<GameHub> hubContext, GameManager gameManager)
    {
        _hubContext = hubContext;
        _gameManager = gameManager;
    }

    public void StartTimer(string roomCode, int totalSeconds)
    {
        _ = Task.Run(() => RunTimer(roomCode, totalSeconds));
    }

    private async Task RunTimer(string roomCode, int totalSeconds)
    {
        try
        {
            await Task.Delay(3000); // countdown delay

            for (int remaining = totalSeconds; remaining >= 0; remaining--)
            {
                var game = _gameManager.GetGame(roomCode);
                if (game?.Phase != GamePhase.Playing) return;

                // Send tick every second to all players
                await _hubContext.Clients.Group(roomCode).SendAsync("TimerTick", remaining);
                await Task.Delay(1000);
            }

            // Timer expired — force end round
            var g = _gameManager.GetGame(roomCode);
            if (g?.Phase == GamePhase.Playing)
            {
                await EndRound(roomCode);
            }
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"[GameTimer] Error in timer for room {roomCode}: {ex.Message}");
        }
    }

    public async Task EndRound(string roomCode)
    {
        var results = _gameManager.EndRound(roomCode);
        var leaderboard = _gameManager.GetLeaderboard(roomCode);
        var game = _gameManager.GetGame(roomCode)!;

        await _hubContext.Clients.Group(roomCode).SendAsync("RoundEnded", results);
        await _hubContext.Clients.Group($"{roomCode}-host").SendAsync("LeaderboardUpdate", leaderboard);

        if (game.Phase == GamePhase.GameOver)
        {
            var feasibility = _gameManager.AnalyzeRound(3);
            await _hubContext.Clients.Group(roomCode).SendAsync("GameOver", leaderboard, feasibility);
        }
    }
}
