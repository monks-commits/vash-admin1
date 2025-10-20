// Seat Selection Logic
class SeatSelector {
    constructor() {
        this.selectedSeats = new Set();
        this.init();
    }

    init() {
        // Initialize seat selection for hall maps
        if (document.querySelector('.hall-container')) {
            this.setupSeatSelection();
            this.updateOrderSummary();
        }

        // Initialize form handling
        this.setupFormHandling();
    }

    setupSeatSelection() {
        const seats = document.querySelectorAll('.seat');
        
        seats.forEach(seat => {
            seat.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleSeat(seat);
            });
        });
    }

    toggleSeat(seatElement) {
        const seatId = `${seatElement.dataset.row}-${seatElement.dataset.seat}`;
        
        if (this.selectedSeats.has(seatId)) {
            // Deselect seat
            this.selectedSeats.delete(seatId);
            seatElement.classList.remove('selected');
        } else {
            // Select seat
            this.selectedSeats.add(seatId);
            seatElement.classList.add('selected');
        }
        
        this.updateOrderSummary();
    }

    updateOrderSummary() {
        const selectedSeatsList = document.getElementById('selected-seats-list');
        const ticketsCount = document.getElementById('tickets-count');
        const totalAmount = document.getElementById('total-amount');
        const buyTicketsBtn = document.getElementById('buy-tickets-btn');

        if (!selectedSeatsList || !ticketsCount || !totalAmount) {
            return;
        }

        // Clear existing list
        selectedSeatsList.innerHTML = '';

        if (this.selectedSeats.size === 0) {
            selectedSeatsList.innerHTML = '<li>Оберіть місця на схемі</li>';
            ticketsCount.textContent = '0';
            totalAmount.textContent = '0 грн';
            if (buyTicketsBtn) {
                buyTicketsBtn.style.display = 'none';
            }
            return;
        }

        let totalPrice = 0;
        const seatsData = [];

        this.selectedSeats.forEach(seatId => {
            const [row, seat] = seatId.split('-');
            const seatElement = document.querySelector(`[data-row="${row}"][data-seat="${seat}"]`);
            
            if (seatElement) {
                const price = parseInt(seatElement.dataset.price);
                totalPrice += price;
                seatsData.push({
                    row: row,
                    seat: seat,
                    price: price
                });
            }
        });

        // Sort seats by row and seat number
        seatsData.sort((a, b) => {
            if (a.row !== b.row) {
                return parseInt(a.row) - parseInt(b.row);
            }
            return parseInt(a.seat) - parseInt(b.seat);
        });

        // Update the list
        seatsData.forEach(seat => {
            const listItem = document.createElement('li');
            listItem.textContent = `Ряд ${seat.row}, Місце ${seat.seat} - ${seat.price} грн`;
            selectedSeatsList.appendChild(listItem);
        });

        // Update counters
        ticketsCount.textContent = this.selectedSeats.size;
        totalAmount.textContent = `${totalPrice} грн`;

        // Show buy button
        if (buyTicketsBtn) {
            buyTicketsBtn.style.display = 'inline-block';
        }

        // Store selected seats in localStorage for checkout
        this.saveSelectedSeats(seatsData, totalPrice);
    }

    saveSelectedSeats(seatsData, totalPrice) {
        const orderData = {
            seats: seatsData,
            totalPrice: totalPrice,
            timestamp: Date.now()
        };
        
        localStorage.setItem('selectedSeats', JSON.stringify(orderData));
    }

    setupFormHandling() {
        // Handle checkout form submission
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCheckoutSubmission(checkoutForm);
            });
        }

        // Handle contact form submission
        const contactForm = document.querySelector('.contact-form form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactSubmission(contactForm);
            });
        }
    }

    handleCheckoutSubmission(form) {
        const formData = new FormData(form);
        const orderData = {
            fullname: formData.get('fullname'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            comments: formData.get('comments'),
            paymentMethod: formData.get('payment'),
            timestamp: Date.now()
        };

        // Get selected seats from localStorage
        const selectedSeats = localStorage.getItem('selectedSeats');
        if (selectedSeats) {
            orderData.seats = JSON.parse(selectedSeats);
        }

        // Simulate order processing
        this.showOrderConfirmation(orderData);
    }

    handleContactSubmission(form) {
        const formData = new FormData(form);
        const contactData = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            timestamp: Date.now()
        };

        // Simulate message sending
        this.showContactConfirmation(contactData);
    }

    showOrderConfirmation(orderData) {
        // Create confirmation modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Замовлення оформлено!</h3>
                <p>Дякуємо за ваше замовлення. Наш менеджер зв'яжеться з вами найближчим часом для підтвердження.</p>
                <div class="order-details">
                    <p><strong>ПІБ:</strong> ${orderData.fullname}</p>
                    <p><strong>Email:</strong> ${orderData.email}</p>
                    <p><strong>Телефон:</strong> ${orderData.phone}</p>
                    <p><strong>Спосіб оплати:</strong> ${this.getPaymentMethodName(orderData.paymentMethod)}</p>
                </div>
                <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Закрити</button>
            </div>
        `;

        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            .modal-content {
                background-color: white;
                padding: 2rem;
                border-radius: 8px;
                max-width: 500px;
                width: 90%;
                text-align: center;
            }
            .modal-content h3 {
                color: #006400;
                margin-bottom: 1rem;
            }
            .order-details {
                text-align: left;
                margin: 1rem 0;
                padding: 1rem;
                background-color: #f8f9fa;
                border-radius: 4px;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(modal);

        // Clear localStorage
        localStorage.removeItem('selectedSeats');
    }

    showContactConfirmation(contactData) {
        // Create confirmation modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Повідомлення надіслано!</h3>
                <p>Дякуємо за ваш запит. Ми відповімо вам найближчим часом.</p>
                <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Закрити</button>
            </div>
        `;

        document.body.appendChild(modal);
    }

    getPaymentMethodName(method) {
        const methods = {
            'card': 'Банківська картка',
            'google-pay': 'Google Pay',
            'apple-pay': 'Apple Pay'
        };
        return methods[method] || method;
    }
}

// Navigation and UI enhancements
class NavigationManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupActiveNavigation();
        this.setupSmoothScrolling();
        this.setupMobileMenu();
    }

    setupActiveNavigation() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    setupSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupMobileMenu() {
        // Create mobile menu toggle if needed
        const header = document.querySelector('.header');
        if (header && window.innerWidth <= 768) {
            this.createMobileMenu(header);
        }
    }

    createMobileMenu(header) {
        const toggle = document.createElement('button');
        toggle.className = 'mobile-menu-toggle';
        toggle.innerHTML = '☰';
        toggle.style.cssText = `
            display: none;
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #006400;
            cursor: pointer;
            padding: 0.5rem;
        `;

        const nav = header.querySelector('.nav');
        nav.style.cssText = `
            display: none;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: white;
            border-top: 1px solid #e0e0e0;
            padding: 1rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        `;

        toggle.addEventListener('click', () => {
            nav.style.display = nav.style.display === 'none' ? 'flex' : 'none';
        });

        header.appendChild(toggle);

        // Show toggle on mobile
        if (window.innerWidth <= 768) {
            toggle.style.display = 'block';
        }
    }
}

// Image lazy loading and error handling
class ImageManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupLazyLoading();
        this.setupErrorHandling();
    }

    setupLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            images.forEach(img => {
                img.src = img.dataset.src;
            });
        }
    }

    setupErrorHandling() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            img.addEventListener('error', () => {
                img.style.display = 'none';
                
                // Create placeholder
                const placeholder = document.createElement('div');
                placeholder.className = 'placeholder-image';
                placeholder.textContent = 'Зображення недоступне';
                placeholder.style.cssText = `
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #f8f9fa;
                    color: #666;
                    font-size: 0.9rem;
                `;
                
                img.parentNode.insertBefore(placeholder, img);
            });
        });
    }
}

// Form validation
class FormValidator {
    constructor() {
        this.init();
    }

    init() {
        this.setupValidation();
    }

    setupValidation() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input[required], textarea[required]');
            
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });
                
                input.addEventListener('input', () => {
                    this.clearFieldError(input);
                });
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.getAttribute('name');
        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Це поле обов\'язкове для заповнення';
        }

        // Email validation
        if (fieldName === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Введіть коректну email адресу';
            }
        }

        // Phone validation
        if (fieldName === 'phone' && value) {
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(value)) {
                isValid = false;
                errorMessage = 'Введіть коректний номер телефону';
            }
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        } else {
            this.clearFieldError(field);
        }

        return isValid;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.style.borderColor = '#dc3545';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #dc3545;
            font-size: 0.8rem;
            margin-top: 0.25rem;
        `;
        
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.style.borderColor = '';
        
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        let isFormValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });
        
        return isFormValid;
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SeatSelector();
    new NavigationManager();
    new ImageManager();
    new FormValidator();
});

// Utility functions
const Utils = {
    // Format price
    formatPrice: (price) => {
        return new Intl.NumberFormat('uk-UA', {
            style: 'currency',
            currency: 'UAH',
            minimumFractionDigits: 0
        }).format(price);
    },

    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Check if element is in viewport
    isInViewport: (element) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SeatSelector, NavigationManager, ImageManager, FormValidator, Utils };
}

