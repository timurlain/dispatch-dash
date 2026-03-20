namespace DispatchDash.Api.Models;

public enum GamePhase { WaitingForPlayers, Playing, ShowingResults, GameOver }

public class GameState
{
    public string RoomCode { get; init; } = "";
    public GamePhase Phase { get; set; } = GamePhase.WaitingForPlayers;
    public int CurrentRound { get; set; } = 0;
    public Dictionary<string, Player> Players { get; } = new();
    public Dictionary<int, List<Submission>> Submissions { get; } = new();
    public DateTime? RoundStartedAt { get; set; }
    public int? RoundTimerSeconds { get; set; }
}
