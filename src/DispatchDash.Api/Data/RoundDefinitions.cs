namespace DispatchDash.Api.Data;

using DispatchDash.Api.Models;

public static class RoundDefinitions
{
    private static readonly Depot DefaultDepot = new("Zasova", 49.4547, 18.0231);

    private static readonly List<Customer> BaseCustomers =
    [
        new("A", "Vsetin",           49.3388, 17.9962, 4),
        new("B", "Roznov p. R.",     49.4583, 18.1431, 3, TimeWindow.Morning),
        new("C", "Val. Mezirici",    49.4719, 17.9711, 5),
        new("D", "Bystrice p. H.",   49.3964, 17.6694, 3, TimeWindow.Afternoon),
        new("E", "Holesov",          49.3331, 17.5783, 4),
        new("F", "Kromeriz",         49.2977, 17.3933, 2, TimeWindow.Morning),
        new("G", "Zlin",             49.2268, 17.6669, 5, TimeWindow.Afternoon),
        new("H", "Otrokovice",       49.2094, 17.5315, 4),
    ];

    private static readonly Customer RushOrder =
        new("R", "Frenstat p. R.", 49.5480, 18.2108, 4, IsRushOrder: true);

    public static RoundConfig Round1() => new(
        RoundNumber: 1,
        Title: "The Easy Life",
        Description: "One truck, no limits. Just find the shortest route.",
        Customers: BaseCustomers.Select(c => c with { TimeWindow = TimeWindow.None, Demand = 0 }).ToList(),
        Vehicles: [new Vehicle("V1", int.MaxValue)],
        Depot: DefaultDepot,
        TimerSeconds: 90,
        TrafficSegments: []);

    public static RoundConfig Round2() => new(
        RoundNumber: 2,
        Title: "Welcome to Reality",
        Description: "4 trucks, limited capacity, time windows. Welcome to real logistics.",
        Customers: BaseCustomers.ToList(),
        Vehicles: [
            new Vehicle("V1", 20),
            new Vehicle("V2", 20),
            new Vehicle("V3", 20),
            new Vehicle("V4", 20),
        ],
        Depot: DefaultDepot,
        TimerSeconds: 90,
        TrafficSegments: []);

    public static RoundConfig Round3() => new(
        RoundNumber: 3,
        Title: "A Typical Monday",
        Description: "Rush orders, breakdowns, traffic. Can you serve everyone?",
        Customers: BaseCustomers.Append(RushOrder).ToList(),
        Vehicles: [
            new Vehicle("V1", 8),
            new Vehicle("V2", 5),
            new Vehicle("V3", 5),
            new Vehicle("V4", 5),
        ],
        Depot: DefaultDepot,
        TimerSeconds: 120,
        TrafficSegments: [new TrafficSegment("G", "H", 2.0)]);

    public static RoundConfig GetRound(int number) => number switch
    {
        1 => Round1(),
        2 => Round2(),
        3 => Round3(),
        _ => throw new ArgumentOutOfRangeException(nameof(number))
    };
}
