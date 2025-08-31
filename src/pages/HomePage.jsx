import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../contexts/DatabaseContext';
import EventFeedCard from '../components/EventFeedCard';
import FilterModal from '../components/FilterModal';
import { SearchIcon, FilterIcon, PlusIcon } from '../components/Icons';

export default function HomePage() {
  const { events, loading } = useDatabase();
  const navigate = useNavigate();

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    city: '全部',
    dateRange: '全部',
    category: '全部',
  });
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);

  // Helper function to check date ranges
  const checkDateRange = (eventDate, range) => {
    const now = new Date(); // Use current date for filtering
    now.setHours(0, 0, 0, 0);
    const eventDay = new Date(eventDate);
    eventDay.setHours(0, 0, 0, 0);

    switch (range) {
      case 'today':
        return eventDay.getTime() === now.getTime();
      case 'weekend': {
        const day = now.getDay(); // 0 (Sun) to 6 (Sat)
        const saturday = new Date(now);
        saturday.setDate(now.getDate() - day + 6);
        const sunday = new Date(now);
        sunday.setDate(now.getDate() - day + (day === 0 ? 0 : 7)); // Handle if today is Sunday
        return eventDay.getTime() === saturday.getTime() || eventDay.getTime() === sunday.getTime();
      }
      default:
        return true;
    }
  };

  // Memoized filtering logic for performance
  const filteredEvents = useMemo(() => {
    return events
      .filter(event => {
        const cityMatch = filters.city === '全部' || event.city === filters.city;
        const dateMatch = filters.dateRange === '全部' || checkDateRange(event.eventTimestamp, filters.dateRange);
        const categoryMatch = filters.category === '全部' || event.category === filters.category;
        const searchMatch = searchQuery === '' ||
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));
        
        return cityMatch && dateMatch && categoryMatch && searchMatch;
      })
      .sort((a, b) => new Date(a.eventTimestamp) - new Date(b.eventTimestamp));
  }, [events, searchQuery, filters]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const handleEventClick = (event) => {
    navigate(`/event/${event.id}`);
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== '全部').length;

  if (loading) {
    return <div className="p-8 text-center">正在載入活動...</div>;
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800">好揪</h1>
          <p className="text-slate-500">探索你附近的精彩活動</p>
        </header>

        {/* Search and Filter Bar */}
        <div className="sticky top-0 bg-slate-100 py-4 z-10">
          <div className="flex items-center space-x-2 p-2 bg-white rounded-2xl shadow-md">
            <div className="flex-shrink-0 pl-2">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="搜尋活動..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 focus:outline-none bg-transparent"
            />
            <button onClick={() => setFilterModalOpen(true)} className="flex-shrink-0 flex items-center space-x-1 pr-2 relative">
              <FilterIcon className="w-5 h-5 text-gray-600" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map(event => (
              <EventFeedCard
                key={event.id}
                event={event}
                onEventClick={() => handleEventClick(event)}
              />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500 py-10">
              哎呀！找不到符合條件的活動。
            </p>
          )}
        </main>
      </div>

      <button
        onClick={() => navigate('/create-event')}
        className="fixed bottom-20 right-6 bg-blue-800 text-white rounded-full p-4 shadow-lg hover:bg-blue-900 transition-transform transform hover:scale-110 focus:outline-none z-20"
        aria-label="發起新邀約"
      >
        <PlusIcon />
      </button>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        filters={filters}
        onApply={handleApplyFilters}
        events={events} // Pass all events to generate filter options
      />
    </>
  );
}

