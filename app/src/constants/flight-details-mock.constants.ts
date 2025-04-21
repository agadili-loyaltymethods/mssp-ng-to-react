import { TicketType } from "../enums/ticket-type";

export const flightDetails = [
    {
        arrival: '6:00 AM',
        departure: '10:30 AM',
        arrivalId: 503,
        departureId: 3299,
        noStops: 1,
        changeStop: 'DEN',
        duration: '6h 30m',
        isLowFare: true,
        prices: [
            {
                key: TicketType.BUSINESS_SELECT,
                price: 542,
            },
            {
                key: TicketType.ANYTIME,
                price: 492
            }, {
                key: TicketType.WANNA_GET_AWAY_PLUS,
                price: 432
            }, {
                key: TicketType.WANNA_GET_AWAY,
                price: 412
            },
        ]
    },
    {
        arrival: '6:00 AM',
        departure: '11:10 AM',
        arrivalId: 2896,
        departureId: 1911,
        noStops: 1,
        changeStop: 'PHX',
        duration: '7h 10m',
        isLowFare: true,
        prices: [
            {
                key: TicketType.BUSINESS_SELECT,
                price: 542,
            },
            {
                key: TicketType.ANYTIME,
                price: 492
            }, {
                key: TicketType.WANNA_GET_AWAY_PLUS,
                price: 432
            }, {
                key: TicketType.WANNA_GET_AWAY,
                price: 412
            },
        ]
    },
    {
        arrival: '7:50 AM',
        departure: '1:00 PM',
        arrivalId: 3825,
        departureId: 2789,
        noStops: 1,
        changeStop: 'DEN',
        duration: '7h 10m',
        isLowFare: false,
        prices: [
            {
                key: TicketType.BUSINESS_SELECT,
                price: 688,
                noFlightsLeft: 5
            },
            {
                key: TicketType.ANYTIME,
                price: 638,
                noFlightsLeft: 5
            }, {
                key: TicketType.WANNA_GET_AWAY_PLUS,
                price: 503,
                noFlightsLeft: 2
            }
        ]
    },
    {
        arrival: '8:30 AM',
        departure: '1:20 PM',
        arrivalId: 406,
        departureId: 3381,
        noStops: 1,
        changeStop: 'LAS',
        duration: '6h 50m',
        isLowFare: true,
        prices: [
            {
                key: TicketType.BUSINESS_SELECT,
                price: 542
            },
            {
                key: TicketType.ANYTIME,
                price: 492,
                noFlightsLeft: 1
            }, {
                key: TicketType.WANNA_GET_AWAY_PLUS,
                price: 432,
                noFlightsLeft: 1

            }, {
                key: TicketType.WANNA_GET_AWAY,
                price: 412,
                noFlightsLeft: 1

            }
        ]
    }, {
        arrival: '11:40 AM',
        departure: '5:20 PM',
        arrivalId: 1936,
        departureId: 2079,
        noStops: 1,
        changeStop: 'AMF',
        duration: '7h 40m',
        isLowFare: false,
        prices: [
            {
                key: TicketType.BUSINESS_SELECT,
                price: 688,
                noFlightsLeft: 3
            },
            {
                key: TicketType.ANYTIME,
                price: 638,
                noFlightsLeft: 3
            }, {
                key: TicketType.WANNA_GET_AWAY_PLUS,
                price: 503,
                noFlightsLeft: 1

            }
        ]
    },
]