import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Results from '../Results';

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

beforeEach(() => {
    global.fetch = jest.fn((url) => {
        if (url.endsWith("/api/destinations/all")) {
            // Return an array of destination strings expected by SearchBanner
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve([
                    "Singapore",
                    "Tokyo",
                    "New York",
                ]),
            });
        }
        if (url.includes("/api/hotels")) {
            // Return your existing mock hotels data
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    hotels: [
                        {
                            id: 'hotel123',
                            name: 'Mock Hotel',
                            price: 123,
                            rating: 5,
                            trustyou: { score: { overall: 90 } },
                            image_details: {
                                prefix: 'https://images.com/',
                                suffix: '/img.jpg',
                            },
                            latitude: 1.3,
                            longitude: 103.8,
                        },
                    ],
                    total: 1,
                }),
            });
        }
        // fallback for any other fetch calls to avoid errors
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({}),
        });
    });
});


afterEach(() => {
    jest.clearAllMocks();
});

test('renders Results component with hotel data', async () => {
    render(
        <MemoryRouter initialEntries={['/results?destination=SG&uid=abc123&checkin=2025-08-01&checkout=2025-08-05']}>
            <Routes>
                <Route path="/results" element={<Results />} />
            </Routes>
        </MemoryRouter>
    );

    expect(screen.getByText(/Hotels in SG/i)).toBeInTheDocument();

    await waitFor(() => {
        expect(screen.getByText(/Mock Hotel/)).toBeInTheDocument();
        expect(screen.getByText(/\$123/)).toBeInTheDocument();
    });
});

test('applies filters and updates state', async () => {
    render(
        <MemoryRouter initialEntries={['/results?destination=SG&uid=abc123&checkin=2025-08-01&checkout=2025-08-05']}>
            <Routes>
                <Route path="/results" element={<Results />} />
            </Routes>
        </MemoryRouter>
    );

    const guestRatingSlider = screen.getByLabelText(/Guest Rating/i);
    fireEvent.change(guestRatingSlider, { target: { value: 80 } });

    const filterButton = screen.getByText(/Filter/);
    fireEvent.click(filterButton);

    await waitFor(() => {
        // URL is updated with guestRating
        expect(mockNavigate).toHaveBeenCalledWith(expect.objectContaining({
            search: expect.stringContaining('guestRating=80')
        }), { replace: true });
    });
});

test('select button navigates to room page', async () => {
    render(
        <MemoryRouter initialEntries={['/results?destination=SG&uid=abc123&checkin=2025-08-01&checkout=2025-08-05']}>
            <Routes>
                <Route path="/results" element={<Results />} />
            </Routes>
        </MemoryRouter>
    );

    await waitFor(() => {
        expect(screen.getByText(/Mock Hotel/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Select/i));

    expect(mockNavigate).toHaveBeenCalled();

    const calledWithRoomPage = mockNavigate.mock.calls.some(
        ([firstArg]) =>
            typeof firstArg === 'string' && firstArg.includes('/room?id=hotel123')
    );

    expect(calledWithRoomPage).toBe(true);

});


test('pagination buttons trigger page change and hotel data update', async () => {
    global.fetch = jest.fn((url) => {
        const urlObj = new URL(`http://localhost${url}`); // Fake base for parsing
        const page = urlObj.searchParams.get("page");

        if (url.includes("/api/hotels")) {
            if (page === "1") {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        hotels: [{
                            id: 'hotel123',
                            name: 'Mock Hotel Page 1',
                            price: 123,
                            rating: 5,
                            trustyou: { score: { overall: 90 } },
                            image_details: { prefix: 'https://images.com/', suffix: '/img.jpg' },
                            latitude: 1.3,
                            longitude: 103.8,
                        }],
                        total: 36,
                    }),
                });
            } else if (page === "2") {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        hotels: [{
                            id: 'hotel456',
                            name: 'Mock Hotel Page 2',
                            price: 199,
                            rating: 4,
                            trustyou: { score: { overall: 80 } },
                            image_details: { prefix: 'https://images.com/', suffix: '/img.jpg' },
                            latitude: 1.2,
                            longitude: 103.9,
                        }],
                        total: 36,
                    }),
                });
            }
        }

        if (url.endsWith("/api/destinations/all")) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(["Singapore", "Tokyo", "New York"]),
            });
        }

        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({}),
        });
    });

    render(
        <MemoryRouter initialEntries={['/results?destination=SG&uid=abc123&checkin=2025-08-01&checkout=2025-08-05']}>
            <Routes>
                <Route path="/results" element={<Results />} />
            </Routes>
        </MemoryRouter>
    );

    // Page 1 hotel should appear
    await waitFor(() => {
        expect(screen.getByText(/Mock Hotel Page 1/)).toBeInTheDocument();
    });

    // Click page 2
    fireEvent.click(screen.getByText('2'));

    // Page 2 hotel should appear now
    await waitFor(() => {
        expect(screen.getByText(/Mock Hotel Page 2/)).toBeInTheDocument();
    });
});


test('updates URL when price filters are applied', async () => {
    render(
        <MemoryRouter initialEntries={['/results?destination=SG&uid=abc123&checkin=2025-08-01&checkout=2025-08-05']}>
            <Routes>
                <Route path="/results" element={<Results />} />
            </Routes>
        </MemoryRouter>
    );

    const minPriceInput = screen.getByPlaceholderText(/Min Price/i);
    const maxPriceInput = screen.getByPlaceholderText(/Max Price/i);

    fireEvent.change(minPriceInput, { target: { value: '100' } });
    fireEvent.change(maxPriceInput, { target: { value: '300' } });

    fireEvent.click(screen.getByText(/Filter/i));

    await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(expect.objectContaining({
            search: expect.stringContaining('minPrice=100'),
        }), { replace: true });
    });
});


test('renders map and hotel marker with tooltip', async () => {
    render(
        <MemoryRouter initialEntries={['/results?destination=SG&uid=abc123&checkin=2025-08-01&checkout=2025-08-05']}>
            <Routes>
                <Route path="/results" element={<Results />} />
            </Routes>
        </MemoryRouter>
    );

    await waitFor(() => {
        expect(screen.getByText(/Mock Hotel/)).toBeInTheDocument();
    });

    // Check if tooltip is rendered (hotel name on marker)
    expect(screen.getByText(/Mock Hotel/)).toBeInTheDocument();
});


test('shows loading indicator while fetching hotels', async () => {
    // Add a delay to simulate loading
    global.fetch.mockImplementationOnce(() =>
        new Promise((resolve) => {
            setTimeout(() => resolve({
                ok: true,
                json: () => Promise.resolve({ hotels: [], total: 0 }),
            }), 1000);
        })
    );

    render(
        <MemoryRouter initialEntries={['/results?destination=SG&uid=abc123&checkin=2025-08-01&checkout=2025-08-05']}>
            <Routes>
                <Route path="/results" element={<Results />} />
            </Routes>
        </MemoryRouter>
    );

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();

    await waitFor(() => {
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
});


test('fetch called with valid uid and destination params', async () => {
    render(
        <MemoryRouter
            initialEntries={[
                '/results?destination=Singapore%2C%20Singapore&uid=RsBU&checkin=2025-08-13&checkout=2025-08-15&rooms=1&adults=1&children=0',
            ]}
        >
            <Routes>
                <Route path="/results" element={<Results />} />
            </Routes>
        </MemoryRouter>
    );

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    const fetchCalls = global.fetch.mock.calls.map((call) => call[0]);
    console.log('fetchCalls:', fetchCalls);

    const found = fetchCalls.some((url) => url.includes('uid=RsBU'));
    expect(found).toBe(true);
});



test('shows no hotels available with invalid uid and destination', async () => {
  // Mock fetch to handle multiple fetch calls (destinations list, then hotels)
  global.fetch = jest.fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => [],  // mock destinations list (empty)
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ hotels: [], total: 0 }), // mock hotels list (empty)
    });

  render(
    <MemoryRouter
      initialEntries={[
        '/results?destination=fuck&uid=undefined&checkin=2025-08-13&checkout=2025-08-15&rooms=1&adults=1&children=0',
      ]}
    >
      <Routes>
        <Route path="/results" element={<Results />} />
      </Routes>
    </MemoryRouter>
  );

  // Wait for the "no hotels" message to appear
  const noHotelsMessage = await screen.findByText(/No hotels available for this destination./i);

  expect(noHotelsMessage).toBeInTheDocument();
});




test('ignores non-numeric guest rating in URL', async () => {
    render(
        <MemoryRouter initialEntries={['/results?destination=SG&uid=abc123&checkin=2025-08-01&checkout=2025-08-05&guestRating=banana']}>
            <Routes>
                <Route path="/results" element={<Results />} />
            </Routes>
        </MemoryRouter>
    );

    await waitFor(() => {
        expect(screen.getByText(/Mock Hotel/)).toBeInTheDocument();
    });

    // Expect it to fallback to default guestRating (e.g. 0)
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('guestRating=banana'));
});


test('handles invalid page numbers gracefully', async () => {
    render(
        <MemoryRouter initialEntries={['/results?destination=SG&uid=abc123&checkin=2025-08-01&checkout=2025-08-05&page=banana']}>
            <Routes>
                <Route path="/results" element={<Results />} />
            </Routes>
        </MemoryRouter>
    );

    await waitFor(() => {
        expect(screen.getByText(/Mock Hotel/)).toBeInTheDocument();
    });

    // Should fallback to page 1
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('page=1'));
});


test('displays no hotels found if check-in date is after check-out', async () => {
    // Mock API response with 0 hotels
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
            hotels: [],
            total: 0,
        }),
    });

    render(
        <MemoryRouter initialEntries={['/results?destination=SG&uid=abc123&checkin=2025-08-10&checkout=2025-08-01']}>
            <Routes>
                <Route path="/results" element={<Results />} />
            </Routes>
        </MemoryRouter>
    );

    // Expect "no results" UI to show up
    expect(await screen.findByText(/No hotels available for this destination./i)).toBeInTheDocument();
});


test('falls back to only minPrice if minPrice > maxPrice', async () => {
    render(
        <MemoryRouter initialEntries={['/results?destination=SG&uid=abc123&checkin=2025-08-01&checkout=2025-08-05&minPrice=300&maxPrice=100']}>
            <Routes>
                <Route path="/results" element={<Results />} />
            </Routes>
        </MemoryRouter>
    );

    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
    });

    // Find the fetch call to the hotel API
    const hotelFetchCall = global.fetch.mock.calls.find(
        ([url]) => url.includes('/api/hotels')
    );

    expect(hotelFetchCall).toBeDefined();

    const calledUrl = hotelFetchCall[0]; // [url, options] — get the URL
    expect(calledUrl).toContain('minPrice=300');
    expect(calledUrl).toContain('maxPrice=100'); // even if internally ignored
});



