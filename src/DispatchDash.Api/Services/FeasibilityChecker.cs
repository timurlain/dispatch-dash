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
    private const int UnvisitedPenalty = 1000;

    public FeasibilityResult Analyze(RoundConfig round)
    {
        var totalDemand = round.Customers.Sum(c => c.Demand);
        var totalCapacity = round.Vehicles.Sum(v => v.Capacity);

        if (totalCapacity > 1_000_000) totalCapacity = totalDemand; // Round 1 unlimited

        var shortfall = Math.Max(0, totalDemand - totalCapacity);
        var isFeasible = shortfall == 0;

        double theoreticalMinPenalty = 0;
        var explanation = "Všichni zákazníci mohou být obslouženi v rámci kapacity.";

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

            var custWord = skippedCount == 1 ? "zákazníka"
                : (skippedCount >= 2 && skippedCount <= 4 ? "zákazníky" : "zákazníků");

            explanation = $"Celková poptávka: {totalDemand} jednotek. " +
                          $"Celková kapacita: {totalCapacity} jednotek. " +
                          $"Deficit: {shortfall} jednotek. " +
                          $"Musíš vynechat alespoň {skippedCount} {custWord}.";
        }

        return new FeasibilityResult(isFeasible, totalDemand, totalCapacity, shortfall,
            theoreticalMinPenalty, explanation);
    }
}
