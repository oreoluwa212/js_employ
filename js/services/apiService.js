// js/services/apiService.js
class APIService {
    constructor() {
        this.baseURL = 'https://jsonplaceholder.typicode.com';
        this.newsAPI_KEY = 'YOUR_NEWS_API_KEY'; // For NewsAPI integration
        this.newsBaseURL = 'https://newsapi.org/v2';
    }

    // Generic fetch method with error handling
    async fetchData(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw new Error(`Failed to fetch data: ${error.message}`);
        }
    }

    // Get paginated posts (using JSONPlaceholder posts as blog articles)
    async getPosts(page = 1, limit = 10) {
        const start = (page - 1) * limit;
        const posts = await this.fetchData(`/posts?_start=${start}&_limit=${limit}`);

        // Transform JSONPlaceholder posts to match our blog structure
        return posts.map(post => ({
            id: post.id,
            title: post.title,
            description: post.body,
            author: `User ${post.userId}`,
            authorAvatar: `https://via.placeholder.com/50?text=U${post.userId}`,
            createdAt: new Date().toISOString(),
            images: [`https://picsum.photos/400/300?random=${post.id}`]
        }));
    }

    // Get single post by ID
    async getPostById(id) {
        const post = await this.fetchData(`/posts/${id}`);
        const user = await this.fetchData(`/users/${post.userId}`);

        return {
            id: post.id,
            title: post.title,
            description: post.body,
            author: user.name,
            authorAvatar: `https://via.placeholder.com/50?text=${user.name[0]}`,
            createdAt: new Date().toISOString(),
            images: [
                `https://picsum.photos/800/400?random=${post.id}`,
                `https://picsum.photos/800/400?random=${post.id + 100}`,
                `https://picsum.photos/800/400?random=${post.id + 200}`
            ]
        };
    }

    // Create new post
    async createPost(postData) {
        const newPost = await this.fetchData('/posts', {
            method: 'POST',
            body: JSON.stringify(postData)
        });

        return {
            ...newPost,
            author: postData.author || 'Anonymous',
            authorAvatar: `https://via.placeholder.com/50?text=A`,
            createdAt: new Date().toISOString(),
            images: [`https://picsum.photos/400/300?random=${Date.now()}`]
        };
    }

    // Update post
    async updatePost(id, postData) {
        return await this.fetchData(`/posts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(postData)
        });
    }

    // Delete post
    async deletePost(id) {
        return await this.fetchData(`/posts/${id}`, {
            method: 'DELETE'
        });
    }

    // Get comments for a post
    async getComments(postId) {
        return await this.fetchData(`/posts/${postId}/comments`);
    }

    // Search posts (simulated)
    async searchPosts(query) {
        const allPosts = await this.fetchData('/posts');
        return allPosts.filter(post =>
            post.title.toLowerCase().includes(query.toLowerCase()) ||
            post.body.toLowerCase().includes(query.toLowerCase())
        ).map(post => ({
            id: post.id,
            title: post.title,
            description: post.body,
            author: `User ${post.userId}`,
            authorAvatar: `https://via.placeholder.com/50?text=U${post.userId}`,
            createdAt: new Date().toISOString(),
            images: [`https://picsum.photos/400/300?random=${post.id}`]
        }));
    }

    // Get news from NewsAPI (requires API key)
    async getLatestNews(category = 'technology', limit = 10) {
        if (!this.newsAPI_KEY || this.newsAPI_KEY === 'YOUR_NEWS_API_KEY') {
            // Fallback to JSONPlaceholder if no NewsAPI key
            return this.getPosts(1, limit);
        }

        try {
            const response = await fetch(
                `${this.newsBaseURL}/top-headlines?category=${category}&pageSize=${limit}&apiKey=${this.newsAPI_KEY}`
            );

            if (!response.ok) throw new Error('NewsAPI request failed');

            const data = await response.json();
            return data.articles.map((article, index) => ({
                id: `news-${Date.now()}-${index}`,
                title: article.title,
                description: article.description || article.content,
                author: article.author || 'Unknown Author',
                authorAvatar: `https://via.placeholder.com/50?text=${(article.author || 'A')[0]}`,
                createdAt: article.publishedAt,
                images: article.urlToImage ? [article.urlToImage] : [`https://picsum.photos/400/300?random=${index}`],
                url: article.url
            }));
        } catch (error) {
            console.warn('NewsAPI failed, falling back to JSONPlaceholder:', error);
            return this.getPosts(1, limit);
        }
    }
}

// Export singleton instance
const apiService = new APIService();
export default apiService;