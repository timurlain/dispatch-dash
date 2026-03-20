namespace DispatchDash.Api.Models;

public record RouteSubmission(string VehicleId, List<string> CustomerIds);

public record Submission(
    string PlayerId,
    int RoundNumber,
    List<RouteSubmission> Routes,
    double? Score = null,
    double? DistanceScore = null,
    double? PenaltyScore = null,
    double? CapacityPenalty = null,
    double? TimeWindowPenalty = null,
    double? UnvisitedPenalty = null,
    int? Rank = null);
