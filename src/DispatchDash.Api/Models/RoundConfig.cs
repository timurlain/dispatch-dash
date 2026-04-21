namespace DispatchDash.Api.Models;

public record TrafficSegment(string FromId, string ToId, double Multiplier);

public record RoundConfig(
    int RoundNumber,
    string Title,
    string Description,
    List<Customer> Customers,
    List<Vehicle> Vehicles,
    Depot Depot,
    int TimerSeconds,
    int IntroSeconds,
    List<TrafficSegment> TrafficSegments);
