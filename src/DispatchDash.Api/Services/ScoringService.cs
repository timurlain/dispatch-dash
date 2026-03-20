namespace DispatchDash.Api.Services;

using DispatchDash.Api.Models;

public record ScoreResult(
    double DistanceScore,
    double PenaltyScore,
    double TotalScore,
    double RawDistanceKm,
    double CapacityPenalty,
    double TimeWindowPenalty,
    double UnvisitedPenalty);

public class ScoringService
{
    private const double RoadFactor = 1.3;
    private const double DistanceScaleFactor = 10.0; // km → score points
    private const int CapacityPenaltyPerUnit = 50;
    private const int TimeWindowPenaltyPerViolation = 80;
    private const int UnvisitedPenaltyPerCustomer = 200;

    public static double HaversineKm(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371.0;
        var dLat = ToRad(lat2 - lat1);
        var dLon = ToRad(lon2 - lon1);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c;
    }

    public ScoreResult Score(List<RouteSubmission> routes, RoundConfig round)
    {
        var customerMap = round.Customers.ToDictionary(c => c.Id);
        var visitedIds = routes.SelectMany(r => r.CustomerIds).ToHashSet();

        var rawDistanceKm = 0.0;
        var capacityPenalty = 0.0;
        var timeWindowPenalty = 0.0;

        foreach (var route in routes)
        {
            var vehicle = round.Vehicles.FirstOrDefault(v => v.Id == route.VehicleId);
            if (vehicle is null) continue;

            // Distance: depot → c1 → c2 → ... → depot
            var points = new List<(double Lat, double Lon)> { (round.Depot.Lat, round.Depot.Lon) };
            foreach (var cid in route.CustomerIds)
            {
                if (customerMap.TryGetValue(cid, out var c))
                    points.Add((c.Lat, c.Lon));
            }
            points.Add((round.Depot.Lat, round.Depot.Lon)); // return to depot

            for (int i = 0; i < points.Count - 1; i++)
            {
                var dist = HaversineKm(points[i].Lat, points[i].Lon,
                                        points[i + 1].Lat, points[i + 1].Lon) * RoadFactor;

                // Check traffic segments (bidirectional)
                if (i > 0 && i < points.Count - 1)
                {
                    var fromId = route.CustomerIds.ElementAtOrDefault(i - 1);
                    var toId = route.CustomerIds.ElementAtOrDefault(i);
                    if (fromId is not null && toId is not null)
                    {
                        var seg = round.TrafficSegments.FirstOrDefault(s =>
                            (s.FromId == fromId && s.ToId == toId) ||
                            (s.FromId == toId && s.ToId == fromId));
                        if (seg is not null)
                            dist *= seg.Multiplier;
                    }
                }

                rawDistanceKm += dist;
            }

            // Capacity check
            var totalDemand = route.CustomerIds
                .Where(id => customerMap.ContainsKey(id))
                .Sum(id => customerMap[id].Demand);
            var overload = totalDemand - vehicle.Capacity;
            if (overload > 0)
                capacityPenalty += overload * CapacityPenaltyPerUnit;

            // Time window check: morning = first half of route, afternoon = second half
            var count = route.CustomerIds.Count;
            var midpoint = count / 2;
            for (int i = 0; i < count; i++)
            {
                if (!customerMap.TryGetValue(route.CustomerIds[i], out var customer)) continue;
                if (customer.TimeWindow == TimeWindow.Morning && i >= midpoint && count > 1)
                    timeWindowPenalty += TimeWindowPenaltyPerViolation;
                else if (customer.TimeWindow == TimeWindow.Afternoon && i < midpoint && count > 1)
                    timeWindowPenalty += TimeWindowPenaltyPerViolation;
            }
        }

        // Unvisited penalty
        var unvisitedCount = round.Customers.Count(c => !visitedIds.Contains(c.Id));
        var unvisitedPenalty = unvisitedCount * UnvisitedPenaltyPerCustomer;

        var distanceScore = Math.Round(rawDistanceKm * DistanceScaleFactor, 1);
        var penaltyScore = capacityPenalty + timeWindowPenalty + unvisitedPenalty;

        return new ScoreResult(
            DistanceScore: distanceScore,
            PenaltyScore: penaltyScore,
            TotalScore: distanceScore + penaltyScore,
            RawDistanceKm: Math.Round(rawDistanceKm, 2),
            CapacityPenalty: capacityPenalty,
            TimeWindowPenalty: timeWindowPenalty,
            UnvisitedPenalty: unvisitedPenalty);
    }

    private static double ToRad(double deg) => deg * Math.PI / 180.0;
}
