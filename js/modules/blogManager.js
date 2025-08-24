// js/modules/blogManager.js
import apiService from '../services/apiService.js';
import UIComponents from '../components/uiComponents.js';

class BlogManager {
    constructor() {
        this.currentPage = 1;
        this.postsPerPage = 10;
        this.totalPages = 1;
        this.currentPosts = [];
        this.isLoading = false;
        this.searchQuery = '';
        this.sortOption = 'newest';

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadPosts();
        this.setupSearch();
    }

    bindEvents() {
        // Pagination events
        document.addEventListener('click', (e) => {
            if (e.target.id === 'prev-btn') {
                this.previousPage();
            } else if (e.target.id === 'next-btn') {
                this.nextPage();
            } else if (e.target.classList.contains('page-btn')) {
                this.goToPage(parseInt(e.target.dataset.page));
            }
        });

        // Modal events
        const openModalBtn = document.getElementById('openModal');
        if (openModalBtn) {
            openModalBtn.addEventListener('click', () => this.openCreateModal());
        }

        // Form submissions
        this.setupFormHandlers();

        // Card actions
        this.setupCardActions();
    }

    setupFormHandlers() {
        // Create post form
        const createForm = document.getElementById('news-form');
        if (createForm) {
            createForm.addEventListener('submit', (e) => this.handleCreatePost(e));
        }

        // Edit post form
        const editForm = document.getElementById('edit-news-form');
        if (editForm) {
            editForm.addEventListener('submit', (e) => this.handleUpdatePost(e));
        }
    }

    setupCardActions() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-btn')) {
                this.handleEdit(e.target.closest('.edit-btn'));
            } else if (e.target.closest('.delete-btn')) {
                this.handleDelete(e.target.closest('.delete-btn'));
            }
        });
    }

    setupSearch() {
        const searchContainer = document.querySelector('.cta-button-container');
        if (searchContainer) {
            // Add search component
            const searchHTML = UIComponents.createSearchComponent();
            searchContainer.insertAdjacentHTML('afterend', searchHTML);

            // Bind search events
            const searchInput = document.getElementById('search-input');
            const searchBtn = document.getElementById('search-btn');
            const sortFilter = document.getElementById('sort-filter');

            if (searchInput && searchBtn) {
                searchBtn.addEventListener('click', () => this.performSearch());
                searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.performSearch();
                });

                // Debounced search
                let searchTimeout;
                searchInput.addEventListener('input', (e) => {
                    clearTimeout(searchTimeout);
                    searchTimeout = setTimeout(() => {
                        if (e.target.value.length >= 2 || e.target.value.length === 0) {
                            this.searchQuery = e.target.value;
                            this.performSearch();
                        }
                    }, 500);
                });
            }

            if (sortFilter) {
                sortFilter.addEventListener('change', (e) => {
                    this.sortOption = e.target.value;
                    this.applySorting();
                });
            }
        }
    }

    async loadPosts(page = 1) {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoading();

        try {
            const posts = await apiService.getPosts(page, this.postsPerPage);
            this.currentPosts = posts;
            this.currentPage = page;
            this.totalPages = Math.ceil(100 / this.postsPerPage); // Assuming 100 total posts

            this.renderPosts(posts);
            this.updatePagination();

        } catch (error) {
            this.showError('Failed to load posts. Please try again later.');
            console.error('Error loading posts:', error);
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    async performSearch() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoading();

        try {
            let posts;
            if (this.searchQuery.trim()) {
                posts = await apiService.searchPosts(this.searchQuery);
            } else {
                posts = await apiService.getPosts(1, this.postsPerPage);
            }

            this.currentPosts = posts;
            this.applySorting();

        } catch (error) {
            this.showError('Search failed. Please try again.');
            console.error('Search error:', error);
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    applySorting() {
        let sortedPosts = [...this.currentPosts];

        switch (this.sortOption) {
            case 'newest':
                sortedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                sortedPosts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'title':
                sortedPosts.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }

        this.renderPosts(sortedPosts);
    }

    renderPosts(posts) {
        const newsList = document.getElementById('news-list');
        if (!newsList) return;

        if (posts.length === 0) {
            newsList.innerHTML = `
        <div class="no-posts">
          <h3>No posts found</h3>
          <p>Try adjusting your search terms or create a new post.</p>
        </div>
      `;
            return;
        }

        const postsHTML = posts.map(post =>
            UIComponents.createBlogCard(post, true)
        ).join('');

        newsList.innerHTML = postsHTML;

        // Setup lazy loading for new images
        UIComponents.setupLazyLoading();
    }

    updatePagination() {
        const paginationContainer = document.querySelector('.pagination');
        if (!paginationContainer) return;

        const paginationHTML = UIComponents.createPagination(this.currentPage, this.totalPages);
        paginationContainer.outerHTML = paginationHTML;
    }

    async handleCreatePost(event) {
        event.preventDefault();

        const title = document.getElementById('news-title').value;
        const author = document.getElementById('news-author').value;
        const description = document.getElementById('news-description').value;

        if (!title || !author || !description) {
            UIComponents.createToast('Please fill in all fields', 'warning');
            return;
        }

        try {
            const newPost = { title, author, body: description };
            const createdPost = await apiService.createPost(newPost);

            // Add to current posts array
            this.currentPosts.unshift(createdPost);
            this.renderPosts(this.currentPosts);

            // Close modal and reset form
            this.closeModal('modal');
            event.target.reset();

            UIComponents.createToast('Blog post created successfully!', 'success');

        } catch (error) {
            UIComponents.createToast('Failed to create post. Please try again.', 'error');
            console.error('Error creating post:', error);
        }
    }

    async handleUpdatePost(event) {
        event.preventDefault();

        const id = document.getElementById('edit-news-id').value;
        const title = document.getElementById('edit-news-title').value;
        const author = document.getElementById('edit-news-author').value;
        const description = document.getElementById('edit-news-description').value;

        try {
            const updatedData = { title, author, body: description };
            await apiService.updatePost(id, updatedData);

            // Update in current posts array
            const postIndex = this.currentPosts.findIndex(post => post.id == id);
            if (postIndex !== -1) {
                this.currentPosts[postIndex] = { ...this.currentPosts[postIndex], title, author, description };
                this.renderPosts(this.currentPosts);
            }

            this.closeModal('edit-modal');
            UIComponents.createToast('Post updated successfully!', 'success');

        } catch (error) {
            UIComponents.createToast('Failed to update post. Please try again.', 'error');
            console.error('Error updating post:', error);
        }
    }

    async handleDelete(button) {
        const postId = button.getAttribute('data-id');

        if (!confirm('Are you sure you want to delete this post?')) {
            return;
        }

        try {
            await apiService.deletePost(postId);

            // Remove from current posts array
            this.currentPosts = this.currentPosts.filter(post => post.id != postId);
            this.renderPosts(this.currentPosts);

            UIComponents.createToast('Post deleted successfully!', 'success');

        } catch (error) {
            UIComponents.createToast('Failed to delete post. Please try again.', 'error');
            console.error('Error deleting post:', error);
        }
    }

    handleEdit(button) {
        const postId = button.getAttribute('data-id');
        const title = button.getAttribute('data-title');
        const author = button.getAttribute('data-author');
        const description = button.getAttribute('data-description');

        // Populate edit form
        document.getElementById('edit-news-id').value = postId;
        document.getElementById('edit-news-title').value = title;
        document.getElementById('edit-news-author').value = author;
        document.getElementById('edit-news-description').value = description;

        this.openModal('edit-modal');
    }

    // Navigation methods
    previousPage() {
        if (this.currentPage > 1) {
            this.loadPosts(this.currentPage - 1);
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.loadPosts(this.currentPage + 1);
        }
    }

    goToPage(page) {
        if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
            this.loadPosts(page);
        }
    }

    // UI Helper methods
    showLoading() {
        const newsList = document.getElementById('news-list');
        if (newsList) {
            newsList.innerHTML = UIComponents.createLoadingSpinner();
        }
    }

    hideLoading() {
        // Loading is hidden when content is rendered
    }

    showError(message) {
        const newsList = document.getElementById('news-list');
        if (newsList) {
            newsList.innerHTML = UIComponents.createErrorMessage(message, this.loadPosts.bind(this));
        }
    }

    openCreateModal() {
        this.openModal('modal');
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    }
}

export default BlogManager;