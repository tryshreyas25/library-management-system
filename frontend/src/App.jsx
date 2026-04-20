import React, { useState, useEffect, createContext, useContext } from 'react';
import { BookOpen, Users, BookMarked, AlertCircle, Search, Plus, Edit, Trash2, LogOut, Menu, X, Home, BarChart3, UserCircle, Calendar, CheckCircle, XCircle } from 'lucide-react';

// Auth Context
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (authData) => {
    setToken(authData.token);
    setUser({ email: authData.email, name: authData.name, role: authData.role });
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify({ email: authData.email, name: authData.name, role: authData.role }));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// API Service
const API_BASE_URL = 'http://localhost:8080/api';

const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let message = 'Request failed';
        try {
          const error = await response.json();
          message = error.message || message;
        } catch (e) {
          // Ignore JSON parse errors for non-JSON error responses
        }
        throw new Error(message);
      }
      // Handle empty/204 or non-JSON responses gracefully
      if (response.status === 204) return null;
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.toLowerCase().includes('application/json')) {
        // Best-effort read to consume the body, ignore content
        try { await response.text(); } catch (_) {}
        return null;
      }
      // Be defensive: parse JSON with fallback to text/null to avoid noisy parse errors
      try {
        return await response.json();
      } catch (_) {
        try { await response.text(); } catch (_) {}
        return null;
      }
    } catch (error) {
      throw error;
    }
  },

  // Auth
  login: (data) => api.request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data) => api.request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  // Books
  getBooks: () => api.request('/books'),
  getBook: (id) => api.request(`/books/${id}`),
  createBook: (data) => api.request('/books', { method: 'POST', body: JSON.stringify(data) }),
  updateBook: (id, data) => api.request(`/books/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBook: (id) => api.request(`/books/${id}`, { method: 'DELETE' }),
  searchBooks: (keyword) => api.request(`/books/search?keyword=${keyword}`),

  // Borrow
  borrowBook: (bookId) => api.request('/borrow', { method: 'POST', body: JSON.stringify({ bookId }) }),
  returnBook: (recordId) => api.request(`/borrow/${recordId}/return`, { method: 'PUT' }),
  getMyBooks: () => api.request('/borrow/my-books'),
  getAllBorrowRecords: () => api.request('/borrow/all'),

  // Reports
  getDashboardStats: () => api.request('/reports/dashboard-stats'),
  getOverdueBooks: () => api.request('/reports/overdue'),
  getMostBorrowedBooks: () => api.request('/reports/most-borrowed'),

  // Users
  getUsers: () => api.request('/users'),
  deleteUser: (id) => api.request(`/users/${id}`, { method: 'DELETE' }),
};

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in`}>
      <div className="flex items-center gap-2">
        {type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
        <span>{message}</span>
      </div>
    </div>
  );
};

// Login Page
const LoginPage = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.login({ email, password });
      onLogin(response);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <BookOpen className="text-indigo-600" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Library Management</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button onClick={onSwitchToRegister} className="text-indigo-600 font-semibold hover:underline">
              Register
            </button>
          </p>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 font-semibold mb-2">Demo Credentials:</p>
          <p className="text-xs text-gray-600">Admin: admin@library.com / admin123</p>
          <p className="text-xs text-gray-600">Member: john@example.com / member123</p>
        </div>
      </div>
    </div>
  );
};

// Register Page
const RegisterPage = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'MEMBER',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.register(formData);
      onRegister(response);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <BookOpen className="text-indigo-600" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-600 mt-2">Join our library community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Create a password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="text-indigo-600 font-semibold hover:underline">
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  if (!stats) return <div className="text-center py-8">Loading...</div>;

  const cards = [
    { title: 'Total Books', value: stats.totalBooks, icon: BookOpen, color: 'bg-blue-500' },
    { title: 'Total Members', value: stats.totalMembers, icon: Users, color: 'bg-green-500' },
    { title: 'Borrowed Books', value: stats.borrowedBooks, icon: BookMarked, color: 'bg-purple-500' },
    { title: 'Overdue Books', value: stats.overdueBooks, icon: AlertCircle, color: 'bg-red-500' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Welcome back, {user.name}!
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{card.value}</p>
              </div>
              <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <card.icon className="text-white" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">Quick Actions</h2>
        <p className="text-indigo-100 mb-6">Manage your library efficiently</p>
        <div className="flex flex-wrap gap-4">
          {user.role === 'ADMIN' ? (
            <>
              <button
                onClick={() => onNavigate('books')}
                className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition"
              >
                Add New Book
              </button>
              <button
                onClick={() => onNavigate('reports')}
                className="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition"
              >
                View Reports
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate('books')}
                className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition"
              >
                Browse Books
              </button>
              <button
                onClick={() => onNavigate('mybooks')}
                className="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition"
              >
                My Borrowed Books
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Books Management Component
const BooksManagement = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [toast, setToast] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const data = await api.getBooks();
      setBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast('Failed to load books', 'error');
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadBooks();
      return;
    }
    try {
      const data = await api.searchBooks(searchTerm);
      setBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast('Search failed', 'error');
    }
  };

  const handleBorrow = async (bookId) => {
    try {
      await api.borrowBook(bookId);
      showToast('Book borrowed successfully!', 'success');
      loadBooks();
    } catch (error) {
      showToast(error.message || 'Failed to borrow book', 'error');
    }
  };

  const handleDelete = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await api.deleteBook(bookId);
      showToast('Book deleted successfully!', 'success');
      loadBooks();
    } catch (error) {
      showToast('Failed to delete book', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Books Library</h1>
        {user.role === 'ADMIN' && (
          <button
            onClick={() => { setEditingBook(null); setShowModal(true); }}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <Plus size={20} />
            Add Book
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by title, author, or category..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Search
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(books || []).map((book) => (
          <div key={book.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <BookOpen className="text-white" size={64} />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{book.title}</h3>
              <p className="text-gray-600 mb-1">by {book.author}</p>
              <p className="text-sm text-gray-500 mb-2">{book.category}</p>
              <p className="text-sm text-gray-500 mb-4">ISBN: {book.isbn}</p>
              
              <div className="flex items-center gap-2 mb-4">
                {book.availability ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    Available
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                    Borrowed
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                {user.role === 'MEMBER' && book.availability && (
                  <button
                    onClick={() => handleBorrow(book.id)}
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
                  >
                    Borrow
                  </button>
                )}
                {user.role === 'ADMIN' && (
                  <>
                    <button
                      onClick={() => { setEditingBook(book); setShowModal(true); }}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <BookModal
          book={editingBook}
          onClose={() => setShowModal(false)}
          onSuccess={() => { loadBooks(); setShowModal(false); showToast('Book saved successfully!', 'success'); }}
        />
      )}
    </div>
  );
};

// Book Modal Component
const BookModal = ({ book, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(book || {
    title: '',
    author: '',
    category: '',
    isbn: '',
    publishedDate: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (book) {
        await api.updateBook(book.id, formData);
      } else {
        await api.createBook(formData);
      }
      onSuccess();
    } catch (error) {
      alert(error.message || 'Failed to save book');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {book ? 'Edit Book' : 'Add New Book'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ISBN</label>
            <input
              type="text"
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Published Date</label>
            <input
              type="date"
              value={formData.publishedDate}
              onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              {book ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// My Borrowed Books Component
const MyBorrowedBooks = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadBorrowedBooks();
  }, []);

  const loadBorrowedBooks = async () => {
    try {
      const data = await api.getMyBooks();
      setBorrowedBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast('Failed to load borrowed books', 'error');
    }
  };

  const handleReturn = async (recordId) => {
    try {
      await api.returnBook(recordId);
      showToast('Book returned successfully!', 'success');
      loadBorrowedBooks();
    } catch (error) {
      showToast('Failed to return book', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const isOverdue = (returnDate) => {
    return new Date(returnDate) < new Date();
  };

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Borrowed Books</h1>

      {(borrowedBooks || []).length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <BookMarked className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No borrowed books</h3>
          <p className="text-gray-600">Start exploring our library and borrow some books!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {(borrowedBooks || []).map((record) => (
            <div key={record.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{record.book.title}</h3>
                  <p className="text-gray-600 mb-1">by {record.book.author}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Borrowed: {new Date(record.borrowDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className={isOverdue(record.returnDate) ? 'text-red-500' : 'text-gray-500'} />
                      <span className={`text-sm font-semibold ${isOverdue(record.returnDate) ? 'text-red-600' : 'text-gray-600'}`}>
                        Due: {new Date(record.returnDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {isOverdue(record.returnDate) && (
                    <div className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-semibold inline-block">
                      Overdue!
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleReturn(record.id)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Return Book
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Reports Component (Admin Only)
const Reports = () => {
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [mostBorrowed, setMostBorrowed] = useState([]);
  const [activeTab, setActiveTab] = useState('overdue');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const [overdue, borrowed] = await Promise.all([
        api.getOverdueBooks(),
        api.getMostBorrowedBooks(),
      ]);
      setOverdueBooks(Array.isArray(overdue) ? overdue : []);
      setMostBorrowed(Array.isArray(borrowed) ? borrowed : []);
    } catch (error) {
      showToast('Failed to load reports', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Reports & Analytics</h1>

      <div className="bg-white rounded-xl shadow-lg mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('overdue')}
            className={`flex-1 px-6 py-4 font-semibold transition ${
              activeTab === 'overdue'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Overdue Books ({overdueBooks.length})
          </button>
          <button
            onClick={() => setActiveTab('popular')}
            className={`flex-1 px-6 py-4 font-semibold transition ${
              activeTab === 'popular'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Most Borrowed Books
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'overdue' && (
            <div>
              {overdueBooks.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No overdue books!</h3>
                  <p className="text-gray-600">All books are returned on time.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {overdueBooks.map((record) => (
                    <div key={record.id} className="border border-red-200 bg-red-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-gray-800">{record.book.title}</h4>
                          <p className="text-sm text-gray-600">Borrowed by: {record.user.name}</p>
                          <p className="text-sm text-gray-600">Email: {record.user.email}</p>
                          <p className="text-sm text-red-600 font-semibold mt-2">
                            Due Date: {new Date(record.returnDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-semibold">
                          Overdue
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'popular' && (
            <div>
              {mostBorrowed.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="mx-auto text-gray-400 mb-4" size={64} />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No data available</h3>
                  <p className="text-gray-600">Start borrowing books to see statistics.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {mostBorrowed.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-xl font-bold text-indigo-600">#{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800">{item.title}</h4>
                            <p className="text-sm text-gray-600">Book ID: {item.bookId}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-indigo-600">{item.borrowCount}</p>
                          <p className="text-sm text-gray-600">times borrowed</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Users Management Component (Admin Only)
const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast('Failed to load users', 'error');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.deleteUser(userId);
      showToast('User deleted successfully!', 'success');
      loadUsers();
    } catch (error) {
      showToast('Failed to delete user', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Users Management</h1>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(users || []).map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      user.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Borrow Records Component (Admin Only)
const BorrowRecords = () => {
  const [records, setRecords] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const data = await api.getAllBorrowRecords();
      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast('Failed to load records', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <h1 className="text-3xl font-bold text-gray-800 mb-8">All Borrow Records</h1>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Book</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Borrow Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Return Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(records || []).map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800">{record.book.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{record.user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(record.borrowDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(record.returnDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      record.status === 'RETURNED'
                        ? 'bg-green-100 text-green-700'
                        : record.status === 'OVERDUE'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, login, logout } = useAuth();

  useEffect(() => {
    if (user) {
      setCurrentPage('dashboard');
    }
  }, [user]);

  const handleLogin = (authData) => {
    login(authData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('login');
  };

  if (!user) {
    return currentPage === 'login' ? (
      <LoginPage onLogin={handleLogin} onSwitchToRegister={() => setCurrentPage('register')} />
    ) : (
      <RegisterPage onRegister={handleLogin} onSwitchToLogin={() => setCurrentPage('login')} />
    );
  }

  const menuItems = user.role === 'ADMIN' ? [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'records', label: 'Borrow Records', icon: BookMarked },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ] : [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'books', label: 'Browse Books', icon: BookOpen },
    { id: 'mybooks', label: 'My Books', icon: BookMarked },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-indigo-800 to-indigo-900 text-white transform transition-transform duration-300 ease-in-out z-30 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <BookOpen size={32} />
            <div>
              <h1 className="text-xl font-bold">Library</h1>
              <p className="text-sm text-indigo-200">Management System</p>
            </div>
          </div>

          <div className="mb-8 p-4 bg-white/10 rounded-lg">
            <div className="flex items-center gap-3">
              <UserCircle size={40} />
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-indigo-200">{user.role}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setCurrentPage(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  currentPage === item.id
                    ? 'bg-white text-indigo-800 font-semibold'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition mt-8"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-600 hover:text-gray-800"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex-1 lg:flex-none">
              <h2 className="text-xl font-bold text-gray-800 ml-4 lg:ml-0">
                {menuItems.find(item => item.id === currentPage)?.label || 'Dashboard'}
              </h2>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {currentPage === 'dashboard' && <Dashboard onNavigate={setCurrentPage} />}
          {currentPage === 'books' && <BooksManagement />}
          {currentPage === 'mybooks' && <MyBorrowedBooks />}
          {currentPage === 'records' && <BorrowRecords />}
          {currentPage === 'users' && <UsersManagement />}
          {currentPage === 'reports' && <Reports />}
        </main>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}