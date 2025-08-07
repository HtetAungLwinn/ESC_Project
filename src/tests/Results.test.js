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
