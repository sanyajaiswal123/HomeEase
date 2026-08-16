import { DUMMY_PROVIDERS } from '../data/dummyProviders';

/**
 * Mock API Service for Providers
 * Built to be easily replaced with apiClient calls in the future.
 */
class ProviderService {
  /**
   * Fetch all providers matching a specific service category.
   * Optionally filters and sorts based on query params.
   */
  async getProvidersByService(serviceName, filters = {}, sortBy = 'Top Rated') {
    return new Promise((resolve) => {
      setTimeout(() => {
        let results = DUMMY_PROVIDERS.filter((p) => p.serviceCategory === serviceName);

        // Apply Filters
        if (filters.verifiedOnly) {
          results = results.filter((p) => p.verifiedBadge === true);
        }

        if (filters.minRating) {
          results = results.filter((p) => p.rating >= filters.minRating);
        }

        if (filters.maxPrice) {
          results = results.filter((p) => p.startingPrice <= filters.maxPrice);
        }

        // Apply Sorting
        switch (sortBy) {
          case 'Top Rated':
            results.sort((a, b) => b.rating - a.rating);
            break;
          case 'Nearest':
            results.sort((a, b) => a.distance - b.distance);
            break;
          case 'Lowest Price':
            results.sort((a, b) => a.startingPrice - b.startingPrice);
            break;
          case 'Most Experienced':
            results.sort((a, b) => b.experienceYears - a.experienceYears);
            break;
          case 'Most Booked':
            results.sort((a, b) => b.completedJobs - a.completedJobs);
            break;
          default:
            break;
        }

        resolve({ data: { success: true, count: results.length, providers: results } });
      }, 500); // Simulate network latency
    });
  }

  /**
   * Fetch a single provider by ID
   */
  async getProviderById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const provider = DUMMY_PROVIDERS.find((p) => p.id === id);
        if (provider) {
          resolve({ data: { success: true, provider } });
        } else {
          reject(new Error('Provider not found'));
        }
      }, 300);
    });
  }

  /**
   * Global search for providers
   */
  async searchProviders(query) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lowerQuery = query.toLowerCase();
        const results = DUMMY_PROVIDERS.filter(
          (p) =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.serviceCategory.toLowerCase().includes(lowerQuery) ||
            p.location.toLowerCase().includes(lowerQuery)
        );
        resolve({ data: { success: true, providers: results } });
      }, 400);
    });
  }
}

export default new ProviderService();
