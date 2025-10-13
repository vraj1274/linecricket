# PostgreSQL Search Integration for TheLineCricket

## 🎯 Overview

This document describes the complete PostgreSQL search integration for TheLineCricket application, providing advanced full-text search capabilities for profiles and posts.

## 🗄️ Database Configuration

### PostgreSQL Setup
- **Server**: PostgreSQL 12
- **Host**: localhost
- **Port**: 5432
- **Database**: linecricket25
- **Username**: postgres
- **Password**: root

### Environment Variables
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=linecricket25
DB_USER=postgres
DB_PASSWORD=root
DATABASE_URL=postgresql://postgres:root@localhost:5432/linecricket25
```

## 🔍 Search Features

### 1. Full-Text Search
- **PostgreSQL FTS**: Uses `to_tsvector` and `plainto_tsquery` for advanced text search
- **Multi-field Search**: Searches across name, description, tagline, and content
- **Language Support**: English language processing
- **Ranking**: Results ranked by relevance

### 2. Advanced Filtering
- **Type Filtering**: Filter by profile type (player, coach, academy, venue, community)
- **Date Filtering**: Filter by creation/update dates
- **Location Filtering**: Filter by city, state, country
- **Status Filtering**: Filter by public/private, verified status

### 3. Sorting Options
- **Name**: Alphabetical sorting
- **Type**: Sort by profile type
- **Date**: Sort by creation/update dates
- **Relevance**: Sort by search relevance score

### 4. Pagination
- **Page-based**: Standard pagination with page/per_page parameters
- **Performance**: Efficient offset/limit queries
- **Metadata**: Total count, page info, navigation flags

## 🚀 API Endpoints

### Profile Search
```
GET /api/search/profiles
```

**Parameters:**
- `q` (string): Search query
- `type` (string): Profile type filter
- `sort` (string): Sort field (name, type, created, updated)
- `order` (string): Sort order (asc, desc)
- `page` (int): Page number
- `per_page` (int): Results per page

**Example:**
```bash
curl "http://localhost:5000/api/search/profiles?q=cricket&type=academy&sort=name&order=asc&page=1&per_page=20"
```

### Post Search
```
GET /api/search/posts
```

**Parameters:**
- `q` (string): Search query
- `type` (string): Post type filter
- `sort` (string): Sort field (created_at, likes, comments)
- `order` (string): Sort order (asc, desc)
- `page` (int): Page number
- `per_page` (int): Results per page

### Search Suggestions
```
GET /api/search/suggestions
```

**Parameters:**
- `q` (string): Partial search query (min 2 characters)
- `limit` (int): Maximum suggestions to return

### Search Analytics
```
GET /api/search/analytics
```

**Returns:**
- Total counts (profiles, users, posts)
- Profile type distribution
- Recent activity
- Search statistics

## 🛠️ Setup Instructions

### 1. Database Setup
```bash
# Run the PostgreSQL setup script
python setup_postgres.py

# Or use the automated runner
python run_postgres_setup.py
```

### 2. Environment Configuration
Create a `.env` file with the database configuration:
```bash
# Copy from env.example
cp env.example .env

# Edit the database settings
DB_HOST=localhost
DB_PORT=5432
DB_NAME=linecricket25
DB_USER=postgres
DB_PASSWORD=root
```

### 3. Start the Application
```bash
# Start the Flask backend
python app.py

# The search endpoints will be available at:
# http://localhost:5000/api/search/
```

## 🔧 Frontend Integration

### Search Service
The frontend uses `searchService.ts` to interact with the PostgreSQL search API:

```typescript
import { searchService } from '../services/searchService';

// Search profiles
const results = await searchService.searchProfiles({
  query: 'cricket academy',
  type: 'academy',
  sort: 'name',
  order: 'asc'
});

// Get suggestions
const suggestions = await searchService.getSuggestions('cricket');

// Get analytics
const analytics = await searchService.getAnalytics();
```

### Profile Switch Context
The `ProfileSwitchContext` has been updated to use PostgreSQL search:

```typescript
// Search profiles using PostgreSQL
useEffect(() => {
  const searchProfiles = async () => {
    const result = await searchService.searchProfiles({
      query: searchQuery,
      type: filterType,
      sort: sortBy,
      order: sortOrder
    });
    
    setFilteredProfiles(result.data);
  };
  
  searchProfiles();
}, [searchQuery, filterType, sortBy, sortOrder]);
```

## 📊 Database Indexes

The setup script creates optimized indexes for search performance:

```sql
-- Text search indexes
CREATE INDEX idx_page_profiles_search ON page_profiles 
USING gin(to_tsvector('english', academy_name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')));

-- Standard indexes
CREATE INDEX idx_page_profiles_name ON page_profiles(academy_name);
CREATE INDEX idx_page_profiles_type ON page_profiles(page_type);
CREATE INDEX idx_page_profiles_user_id ON page_profiles(user_id);
CREATE INDEX idx_page_profiles_created_at ON page_profiles(created_at);

-- User indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Post indexes
CREATE INDEX idx_posts_content ON posts(content);
CREATE INDEX idx_posts_created_at ON posts(created_at);
```

## 🎨 UI Features

### Search Interface
- **Real-time Search**: Instant results as you type
- **Loading States**: Visual feedback during search
- **Error Handling**: Clear error messages
- **Filter Controls**: Type, sort, and order controls
- **Results Counter**: Shows filtered vs total results

### Visual Indicators
- **Loading Spinner**: Shows when searching PostgreSQL
- **Search Status**: Indicates search source (PostgreSQL vs local)
- **Error Messages**: Clear error feedback
- **Filter Badges**: Visual indication of active filters

## 🔍 Search Examples

### Basic Search
```typescript
// Search for cricket academies
const results = await searchService.searchProfiles({
  query: 'cricket academy',
  type: 'academy'
});
```

### Advanced Search
```typescript
// Advanced search with multiple filters
const results = await searchService.advancedSearch({
  query: 'cricket coaching',
  profile_types: ['academy', 'coach'],
  sort_by: 'name',
  sort_order: 'asc'
});
```

### Autocomplete
```typescript
// Get search suggestions
const suggestions = await searchService.getSuggestions('cricket');
// Returns: ['cricket academy', 'cricket coaching', 'cricket ground', ...]
```

## 🚀 Performance Optimizations

### Database Level
- **Full-text search indexes**: Optimized for text search
- **Composite indexes**: Multi-column indexes for common queries
- **Query optimization**: Efficient SQL queries
- **Connection pooling**: Reuse database connections

### Application Level
- **Caching**: Cache frequent search results
- **Pagination**: Limit result sets
- **Async operations**: Non-blocking search
- **Error handling**: Graceful fallbacks

## 🧪 Testing

### Manual Testing
```bash
# Test profile search
curl "http://localhost:5000/api/search/profiles?q=cricket"

# Test post search
curl "http://localhost:5000/api/search/posts?q=match"

# Test suggestions
curl "http://localhost:5000/api/search/suggestions?q=cricket"

# Test analytics
curl "http://localhost:5000/api/search/analytics"
```

### Frontend Testing
1. Open the profile switch dropdown
2. Type in the search box
3. Verify PostgreSQL search results
4. Test filter controls
5. Check loading states and error handling

## 📈 Monitoring

### Search Analytics
- **Search queries**: Track popular search terms
- **Result counts**: Monitor search result volumes
- **Performance**: Track search response times
- **User behavior**: Analyze search patterns

### Database Monitoring
- **Query performance**: Monitor slow queries
- **Index usage**: Verify index effectiveness
- **Connection health**: Monitor database connections
- **Storage usage**: Track database growth

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify connection credentials
   - Test database connectivity

2. **Search Returns No Results**
   - Verify database has data
   - Check search query format
   - Test with simple queries

3. **Slow Search Performance**
   - Check database indexes
   - Monitor query execution plans
   - Consider query optimization

4. **Frontend Search Not Working**
   - Check API endpoints are accessible
   - Verify authentication tokens
   - Check browser console for errors

### Debug Commands
```bash
# Check database connection
psql -h localhost -U postgres -d linecricket25

# Test search query
SELECT * FROM page_profiles WHERE to_tsvector('english', academy_name) @@ plainto_tsquery('english', 'cricket');

# Check indexes
\d+ page_profiles
```

## 🎉 Success Criteria

The PostgreSQL search integration is successful when:

1. ✅ Database connection established
2. ✅ Search indexes created
3. ✅ API endpoints responding
4. ✅ Frontend search working
5. ✅ Real-time search results
6. ✅ Filter controls functional
7. ✅ Loading states working
8. ✅ Error handling robust
9. ✅ Performance optimized
10. ✅ User experience smooth

## 📚 Additional Resources

- [PostgreSQL Full-Text Search Documentation](https://www.postgresql.org/docs/current/textsearch.html)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Context Documentation](https://reactjs.org/docs/context.html)

---

**Note**: This integration provides enterprise-grade search capabilities using PostgreSQL's advanced full-text search features, ensuring fast, accurate, and scalable search functionality for TheLineCricket application.


