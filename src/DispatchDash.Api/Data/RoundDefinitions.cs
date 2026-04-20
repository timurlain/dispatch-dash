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
        new("I", "Uh. Hradiste",     49.0698, 17.4597, 3),
        new("J", "Vizovice",         49.2222, 17.8531, 2, TimeWindow.Morning),
        new("K", "Luhacovice",       49.1003, 17.7603, 4),
        new("L", "Napajedla",        49.1714, 17.5131, 3, TimeWindow.Afternoon),
        new("M", "Hulin",            49.3167, 17.4636, 2),
        new("N", "Slavicin",         49.0856, 17.8817, 3),
        new("O", "Kelc",             49.4364, 17.8264, 2),
    ];

    private static readonly List<Customer> ExtraCustomers =
    [
        new("P", "Uhersky Brod",     49.0247, 17.6486, 4, TimeWindow.Morning),
        new("Q", "Bojkovice",        49.0431, 17.8292, 3),
        new("R", "Brumov-Bylnice",   49.0822, 18.0242, 5, TimeWindow.Afternoon),
        new("S", "Val. Klobouky",    49.1372, 18.0081, 3),
        new("T", "Stare Mesto",      49.0750, 17.4350, 4),
    ];

    private static readonly List<Customer> RushOrders =
    [
        new("U",  "Frenstat p. R.",  49.5480, 18.2108, 4, IsRushOrder: true),
        new("V",  "Novy Jicin",      49.5944, 18.0103, 5, IsRushOrder: true),
        new("W",  "Koprivnice",      49.5994, 18.1447, 3, IsRushOrder: true),
        new("X",  "Prerov",          49.4553, 17.4511, 6, IsRushOrder: true),
        new("Y",  "Prostejov",       49.4722, 17.1117, 4, IsRushOrder: true),
        new("Z",  "Olomouc",         49.5938, 17.2509, 5, IsRushOrder: true),
        new("AA", "Sternberk",       49.7306, 17.2989, 3, IsRushOrder: true),
        new("AB", "Hranice",         49.5478, 17.7347, 4, IsRushOrder: true),
        new("AC", "Lipnik n. B.",    49.5267, 17.5864, 3, IsRushOrder: true),
        new("AD", "Zubri",           49.4667, 18.0933, 2, IsRushOrder: true),
    ];

    public static RoundConfig Round1() => new(
        RoundNumber: 1,
        Title: "Pohodička",
        Description: "Jeden kamion, žádná omezení. Najdi nejkratší trasu.",
        Customers: BaseCustomers.Select(c => c with { TimeWindow = TimeWindow.None, Demand = 0 }).ToList(),
        Vehicles: [new Vehicle("V1", int.MaxValue)],
        Depot: DefaultDepot,
        TimerSeconds: 60,
        TrafficSegments: []);

    public static RoundConfig Round2() => new(
        RoundNumber: 2,
        Title: "Vítejte v realitě",
        Description: "4 kamiony, omezená kapacita, časová okna.",
        Customers: BaseCustomers.Concat(ExtraCustomers).ToList(),
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
        Title: "Typické pondělí",
        Description: "Urgentní objednávky, poruchy, zácpy. Zvládneš obsloužit všechny?",
        Customers: BaseCustomers.Concat(ExtraCustomers).Concat(RushOrders).ToList(),
        Vehicles: [
            new Vehicle("V1", 15),
            new Vehicle("V2", 20),
            new Vehicle("V3", 20),
            new Vehicle("V4", 15),
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
