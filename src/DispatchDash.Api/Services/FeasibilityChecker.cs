namespace DispatchDash.Api.Services;

using DispatchDash.Api.Models;

public record FeasibilityResult(
    bool IsFeasible,
    int TotalDemand,
    int TotalCapacity,
    int CapacityShortfall,
    double TheoreticalMinPenalty,
    string Explanation);

public class FeasibilityChecker
{
    private const int UnvisitedPenalty = 200;

    public FeasibilityResult Analyze(RoundConfig round)
    {
        var totalDemand = round.Customers.Sum(c => c.Demand);
        var totalCapacity = round.Vehicles.Sum(v => v.Capacity);

        if (totalCapacity > 1_000_000) totalCapacity = totalDemand; // Round 1 unlimited

        var shortfall = Math.Max(0, totalDemand - totalCapacity);
        var isFeasible = shortfall == 0;

        double theoreticalMinPenalty = 0;
        var explanation = "All customers can be served within capacity constraints.";

        if (!isFeasible)
        {
            var sorted = round.Customers.OrderBy(c => c.Demand).ToList();
            var unitsFreed = 0;
            var skippedCount = 0;
            foreach (var c in sorted)
            {
                if (unitsFreed >= shortfall) break;
                unitsFreed += c.Demand;
                skippedCount++;
            }
            theoreticalMinPenalty = skippedCount * UnvisitedPenalty;

            explanation = $"Total demand: {totalDemand} units. " +
                          $"Total capacity: {totalCapacity} units. " +
                          $"Shortfall: {shortfall} units. " +
                          $"Must skip at least {skippedCount} customer(s).";
        }

        return new FeasibilityResult(isFeasible, totalDemand, totalCapacity, shortfall,
            theoreticalMinPenalty, explanation);
    }
}
