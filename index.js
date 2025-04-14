// Flashcard data by category
const flashcardsByCategory = {
  basics: [
    { front: 'Hello', back: 'Hola' },
    { front: 'Goodbye', back: 'Adiós' },
    { front: 'Thank you', back: 'Gracias' },
    { front: 'Good morning', back: 'Buenos días' }
  ],
  food: [
    { front: 'Apple', back: 'Manzana' },
    { front: 'Bread', back: 'Pan' },
    { front: 'Water', back: 'Agua' },
    { front: 'Coffee', back: 'Café' }
  ],
  travel: [
    { front: 'Airport', back: 'Aeropuerto' },
    { front: 'Train', back: 'Tren' },
    { front: 'Hotel', back: 'Hotel' },
    { front: 'Beach', back: 'Playa' }
  ],
  verbs: [
    { front: 'To eat', back: 'Comer' },
    { front: 'To sleep', back: 'Dormir' },
    { front: 'To speak', back: 'Hablar' },
    { front: 'To walk', back: 'Caminar' }
  ]
};

// Current active flashcards
let activeCategory = 'basics';
let flashcards = flashcardsByCategory[activeCategory];

// Sample quiz data
const quizQuestions = [
  {
    question: 'Translate: "Hello"',
    options: ['Hola', 'Adiós', 'Gracias', 'Buenos días'],
    correctAnswer: 'Hola'
  },
  {
    question: 'Translate: "Thank you"',
    options: ['Hola', 'Adiós', 'Gracias', 'Buenos días'],
    correctAnswer: 'Gracias'
  },
  {
    question: 'Translate: "Good morning"',
    options: ['Buenos días', 'Buenas tardes', 'Buenas noches', 'Hola'],
    correctAnswer: 'Buenos días'
  },
  {
    question: 'Translate: "Goodbye"',
    options: ['Hola', 'Adiós', 'Gracias', 'Buenos días'],
    correctAnswer: 'Adiós'
  }
];

let currentCardIndex = 0;
let currentQuizIndex = 0;
let quizScore = 0;
let totalQuestions = 0;
let audioRecorder = null;
let audioChunks = [];

// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
  // Set up navigation
  const navLinks = document.querySelectorAll('nav a');
  const sections = document.querySelectorAll('main section');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const navElement = document.querySelector('nav');
  
  // Mobile menu toggle
  mobileMenuToggle.addEventListener('click', () => {
    navElement.classList.toggle('mobile-active');
  });
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remove active class from all links and sections
      navLinks.forEach(l => l.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active-section'));
      
      // Add active class to clicked link
      this.classList.add('active');
      
      // Show corresponding section
      const targetId = this.getAttribute('href').substring(1);
      document.getElementById(targetId).classList.add('active-section');
      
      // Close mobile menu if open
      navElement.classList.remove('mobile-active');
    });
  });

  // Home page - Get Started button
  const getStartedBtn = document.getElementById('get-started-btn');
  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', () => {
      document.querySelector('a[href="#flashcard-decks"]').click();
    });
  }
  
  // Flashcard Deck Selection
  const deckCards = document.querySelectorAll('.deck-card');
  deckCards.forEach(card => {
    card.addEventListener('click', function() {
      const category = this.getAttribute('data-category');
      
      // Update active category and flashcards
      activeCategory = category;
      flashcards = flashcardsByCategory[category];
      currentCardIndex = 0;
      
      // Update deck name display
      document.getElementById('deck-name').textContent = this.querySelector('h3').textContent;
      
      // Navigate to flashcards section
      document.querySelector('a[href="#flashcards"]').click();
      
      // Update the displayed flashcard
      updateFlashcard();
    });
  });
  
  // Flashcard functionality
  const flashcardEl = document.querySelector('.flashcard');
  const frontEl = document.querySelector('.flashcard .front');
  const backEl = document.querySelector('.flashcard .back');
  
  // Click to flip
  flashcardEl.addEventListener('click', () => {
    flashcardEl.classList.toggle('flipped');
  });
  
  // Previous button
  document.getElementById('prev-card').addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent triggering the flashcard flip
    currentCardIndex = (currentCardIndex - 1 + flashcards.length) % flashcards.length;
    updateFlashcard();
  });
  
  // Next button
  document.getElementById('next-card').addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent triggering the flashcard flip
    currentCardIndex = (currentCardIndex + 1) % flashcards.length;
    updateFlashcard();
  });
  
  // Add card button
  document.getElementById('add-card').addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent triggering the flashcard flip
    
    const front = prompt('Enter the front text of the card:');
    const back = prompt('Enter the back text of the card:');
    
    if (front && back) {
      flashcards.push({ front, back });
      currentCardIndex = flashcards.length - 1;
      updateFlashcard();
    }
  });
  
  // Quiz functionality
  initQuiz();
  
  // Upload type selector
  const imageUploadBtn = document.getElementById('image-upload-btn');
  const audioUploadBtn = document.getElementById('audio-upload-btn');
  const imageUploadContainer = document.getElementById('image-upload-container');
  const audioUploadContainer = document.getElementById('audio-upload-container');
  
  imageUploadBtn.addEventListener('click', () => {
    imageUploadBtn.classList.add('active');
    audioUploadBtn.classList.remove('active');
    imageUploadContainer.classList.add('active-upload');
    audioUploadContainer.classList.remove('active-upload');
  });
  
  audioUploadBtn.addEventListener('click', () => {
    audioUploadBtn.classList.add('active');
    imageUploadBtn.classList.remove('active');
    audioUploadContainer.classList.add('active-upload');
    imageUploadContainer.classList.remove('active-upload');
  });
  
  // Image upload functionality
  const imageUploadBox = document.getElementById('image-upload-container');
  const imageFileUpload = document.getElementById('image-file-upload');
  const imagePreviewContainer = document.getElementById('image-preview-container');
  
  imageUploadBox.addEventListener('click', () => {
    imageFileUpload.click();
  });
  
  imageFileUpload.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = function(event) {
        const img = document.createElement('img');
        img.src = event.target.result;
        img.classList.add('image-preview');
        imagePreviewContainer.innerHTML = '';
        imagePreviewContainer.appendChild(img);
      };
      
      reader.readAsDataURL(file);
    }
  });
  
  // Audio upload and recording functionality
  const audioFileUpload = document.getElementById('audio-file-upload');
  const audioPreviewContainer = document.getElementById('audio-preview-container');
  const startRecordingBtn = document.getElementById('start-recording');
  const stopRecordingBtn = document.getElementById('stop-recording');
  
  // File upload
  audioUploadBox = document.getElementById('audio-upload-container');
  
  audioUploadBox.addEventListener('click', (e) => {
    if (e.target === audioUploadBox || e.target.tagName === 'P' || e.target.tagName === 'I') {
      audioFileUpload.click();
    }
  });
  
  audioFileUpload.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      const audioURL = URL.createObjectURL(file);
      createAudioPreview(audioURL);
    }
  });
  
  // Audio recording
  startRecordingBtn.addEventListener('click', async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks = [];
      audioRecorder = new MediaRecorder(stream);
      
      audioRecorder.addEventListener('dataavailable', event => {
        audioChunks.push(event.data);
      });
      
      audioRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
        const audioURL = URL.createObjectURL(audioBlob);
        createAudioPreview(audioURL);
      });
      
      audioRecorder.start();
      startRecordingBtn.disabled = true;
      stopRecordingBtn.disabled = false;
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access your microphone. Please allow microphone access or upload an audio file.');
    }
  });
  
  stopRecordingBtn.addEventListener('click', () => {
    if (audioRecorder && audioRecorder.state !== 'inactive') {
      audioRecorder.stop();
      startRecordingBtn.disabled = false;
      stopRecordingBtn.disabled = true;
    }
  });
  
  // Submit button with loading & error states
  const uploadLoadingSpinner = document.getElementById('upload-loading');
  const uploadErrorMessage = document.getElementById('upload-error');
  
  document.getElementById('submit-upload').addEventListener('click', () => {
    let message = '';
    let isValid = false;
    
    // Hide any previous error messages
    uploadErrorMessage.classList.remove('active');
    
    // Determine which type of upload is active
    if (imageUploadContainer.classList.contains('active-upload')) {
      if (imagePreviewContainer.querySelector('img')) {
        message = 'Image uploaded successfully! The AI is analyzing your image...';
        isValid = true;
      } else {
        message = 'Please upload an image first.';
      }
    } else {
      if (audioPreviewContainer.querySelector('audio')) {
        message = 'Audio uploaded successfully! The AI is analyzing your pronunciation...';
        isValid = true;
      } else {
        message = 'Please upload or record audio first.';
      }
    }
    
    if (isValid) {
      // Show loading spinner
      uploadLoadingSpinner.classList.add('active');
      
      // Simulate API call with timeout
      setTimeout(() => {
        // Hide loading spinner
        uploadLoadingSpinner.classList.remove('active');
        
        // 10% chance of error to demonstrate error handling
        if (Math.random() < 0.1) {
          uploadErrorMessage.classList.add('active');
        } else {
          // If successful upload, navigate to feedback section
          document.querySelector('a[href="#feedback"]').click();
        }
      }, 2000);
    } else {
      alert(message);
    }
  });
  
  // AI Feedback section - play audio buttons
  const playButtons = document.querySelectorAll('.play-audio-btn');
  
  playButtons.forEach(button => {
    button.addEventListener('click', function() {
      // In a real implementation, you would play the actual recorded audio
      // For now, just toggle the icon
      const icon = this.querySelector('i');
      if (icon.classList.contains('fa-play')) {
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
        setTimeout(() => {
          icon.classList.remove('fa-pause');
          icon.classList.add('fa-play');
        }, 2000);
      }
    });
  });
  
  // Reviews Section - Review Form Toggle
  const writeReviewBtn = document.getElementById('write-review-btn');
  const reviewFormContainer = document.getElementById('review-form-container');
  const cancelReviewBtn = document.getElementById('cancel-review');
  
  if (writeReviewBtn && reviewFormContainer) {
    writeReviewBtn.addEventListener('click', () => {
      reviewFormContainer.classList.add('active');
      writeReviewBtn.style.display = 'none';
      // Scroll to form
      reviewFormContainer.scrollIntoView({ behavior: 'smooth' });
    });
    
    cancelReviewBtn.addEventListener('click', () => {
      reviewFormContainer.classList.remove('active');
      writeReviewBtn.style.display = 'inline-flex';
    });
  }
  
  // Star Rating Input
  const ratingInput = document.querySelectorAll('.rating-input i');
  if (ratingInput.length > 0) {
    ratingInput.forEach(star => {
      star.addEventListener('click', function() {
        const rating = parseInt(this.getAttribute('data-rating'));
        
        // Reset all stars
        ratingInput.forEach(s => s.className = 'far fa-star');
        
        // Fill stars up to selected rating
        ratingInput.forEach(s => {
          const starRating = parseInt(s.getAttribute('data-rating'));
          if (starRating <= rating) {
            s.className = 'fas fa-star';
          }
        });
      });
      
      star.addEventListener('mouseover', function() {
        const rating = parseInt(this.getAttribute('data-rating'));
        
        ratingInput.forEach(s => {
          const starRating = parseInt(s.getAttribute('data-rating'));
          if (starRating <= rating) {
            s.classList.add('hover');
          }
        });
      });
      
      star.addEventListener('mouseout', function() {
        ratingInput.forEach(s => {
          s.classList.remove('hover');
        });
      });
    });
  }
  
  // Review Form Submit
  const reviewForm = document.getElementById('review-form');
  if (reviewForm) {
    reviewForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form values
      const stars = document.querySelectorAll('.rating-input i.fas').length;
      const title = document.getElementById('review-title').value;
      const content = document.getElementById('review-content').value;
      
      if (stars === 0) {
        alert('Please select a rating');
        return;
      }
      
      if (title.trim() === '') {
        alert('Please enter a review title');
        return;
      }
      
      if (content.trim() === '') {
        alert('Please enter your review');
        return;
      }
      
      // Create new review (in a real app, this would be sent to a server)
      const newReview = {
        name: 'You',
        date: 'April 12, 2025',
        rating: stars,
        title: title,
        content: content
      };
      
      // For demo purposes, show a success message
      alert('Thank you for your review! It will be published after moderation.');
      
      // Reset form
      reviewForm.reset();
      ratingInput.forEach(s => s.className = 'far fa-star');
      
      // Hide form and show button
      reviewFormContainer.classList.remove('active');
      writeReviewBtn.style.display = 'inline-flex';
    });
  }
  
  // Review Filtering
  const filterButtons = document.querySelectorAll('.filter-btn');
  const reviewCards = document.querySelectorAll('.review-card');
  
  if (filterButtons.length > 0) {
    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // Get filter value
        const filterValue = this.getAttribute('data-filter');
        
        // Filter reviews
        reviewCards.forEach(card => {
          const rating = parseInt(card.getAttribute('data-rating'));
          
          if (filterValue === 'all') {
            card.style.display = 'block';
          } else if (filterValue === '1-2') {
            card.style.display = (rating <= 2) ? 'block' : 'none';
          } else {
            card.style.display = (rating === parseInt(filterValue)) ? 'block' : 'none';
          }
        });
      });
    });
  }
  
  // Review Sorting
  const sortSelect = document.getElementById('sort-reviews');
  const reviewsList = document.getElementById('reviews-list');
  
  if (sortSelect && reviewsList) {
    sortSelect.addEventListener('change', function() {
      const sortValue = this.value;
      const reviews = Array.from(reviewsList.children);
      
      // Sort the reviews based on selected option
      reviews.sort((a, b) => {
        const aRating = parseInt(a.getAttribute('data-rating'));
        const bRating = parseInt(b.getAttribute('data-rating'));
        const aDate = new Date(a.querySelector('.review-date').textContent);
        const bDate = new Date(b.querySelector('.review-date').textContent);
        
        if (sortValue === 'newest') {
          return bDate - aDate;
        } else if (sortValue === 'highest') {
          return bRating - aRating;
        } else if (sortValue === 'lowest') {
          return aRating - bRating;
        }
        
        return 0;
      });
      
      // Clear current reviews
      reviewsList.innerHTML = '';
      
      // Append sorted reviews
      reviews.forEach(review => {
        reviewsList.appendChild(review);
      });
    });
  }
  
  // Blog Category Filtering
  const categoryLinks = document.querySelectorAll('.category-link');
  const blogPosts = document.querySelectorAll('.blog-post');
  
  if (categoryLinks.length > 0) {
    categoryLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove active class from all links
        categoryLinks.forEach(l => l.classList.remove('active'));
        
        // Add active class to clicked link
        this.classList.add('active');
        
        // Get category value
        const categoryValue = this.getAttribute('data-category');
        
        // Filter blog posts
        blogPosts.forEach(post => {
          const postCategory = post.getAttribute('data-category');
          
          if (categoryValue === 'all') {
            post.style.display = '';
          } else {
            post.style.display = (postCategory === categoryValue) ? '' : 'none';
          }
        });
      });
    });
  }
  
  // Blog Search
  const blogSearchInput = document.getElementById('blog-search-input');
  const blogSearchBtn = document.getElementById('blog-search-btn');
  
  if (blogSearchInput && blogSearchBtn) {
    const performSearch = () => {
      const searchTerm = blogSearchInput.value.toLowerCase().trim();
      
      if (searchTerm === '') {
        blogPosts.forEach(post => {
          post.style.display = '';
        });
        return;
      }
      
      blogPosts.forEach(post => {
        const title = post.querySelector('.post-title').textContent.toLowerCase();
        const excerpt = post.querySelector('.post-excerpt').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || excerpt.includes(searchTerm)) {
          post.style.display = '';
        } else {
          post.style.display = 'none';
        }
      });
    };
    
    blogSearchBtn.addEventListener('click', performSearch);
    
    blogSearchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
  }
  
  // Blog Subscribe Form
  const subscribeForm = document.getElementById('subscribe-form');
  
  if (subscribeForm) {
    subscribeForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = this.querySelector('input[type="email"]').value;
      
      if (email.trim() === '') {
        alert('Please enter your email address');
        return;
      }
      
      // For demo purposes, show a success message
      alert('Thank you for subscribing! You will receive our latest articles straight to your inbox.');
      
      // Reset form
      this.reset();
    });
  }
  
  // Helper functions for blog and reviews
  document.querySelectorAll('.pagination-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      // In a real implementation, this would load the next page of items
      // For now, just toggle active class
      document.querySelectorAll('.pagination-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
  
  document.querySelectorAll('.helpful-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const currentText = this.textContent;
      const currentCount = parseInt(currentText.match(/\d+/)[0]);
      this.innerHTML = `<i class="far fa-thumbs-up"></i> Helpful (${currentCount + 1})`;
      this.disabled = true;
    });
  });
  
  // Initialize with first flashcard and set active section
  updateFlashcard();
  document.querySelector('a[href="#home"]').click(); // Activate home tab by default
});

// Update flashcard content
function updateFlashcard() {
  const currentCard = flashcards[currentCardIndex];
  const flashcardEl = document.querySelector('.flashcard');
  const frontEl = document.querySelector('.flashcard .front');
  const backEl = document.querySelector('.flashcard .back');
  
  frontEl.textContent = currentCard.front;
  backEl.textContent = currentCard.back;
  
  // Reset flip state when changing cards
  flashcardEl.classList.remove('flipped');
}

// Initialize quiz
function initQuiz() {
  currentQuizIndex = 0;
  quizScore = 0;
  totalQuestions = 0;
  
  const quizOptions = document.querySelectorAll('.quiz-option');
  const nextQuestionBtn = document.getElementById('next-question');
  
  // Set up the first question
  updateQuizQuestion();
  
  // Add event listeners to quiz options
  quizOptions.forEach(option => {
    option.addEventListener('click', function() {
      // Prevent multiple answers
      if (document.querySelector('.quiz-option.correct') || 
          document.querySelector('.quiz-option.incorrect')) {
        return;
      }
      
      const selectedAnswer = this.textContent;
      const correctAnswer = quizQuestions[currentQuizIndex].correctAnswer;
      const quizFeedback = document.getElementById('quiz-feedback');
      
      totalQuestions++;
      
      if (selectedAnswer === correctAnswer) {
        // Correct answer
        this.classList.add('correct');
        quizFeedback.textContent = 'Correct! Well done.';
        quizFeedback.className = 'quiz-feedback correct';
        quizScore++;
      } else {
        // Incorrect answer
        this.classList.add('incorrect');
        
        // Highlight the correct answer
        quizOptions.forEach(opt => {
          if (opt.textContent === correctAnswer) {
            opt.classList.add('correct');
          }
        });
        
        quizFeedback.textContent = `Incorrect. The right answer is "${correctAnswer}".`;
        quizFeedback.className = 'quiz-feedback incorrect';
      }
      
      // Update score
      document.getElementById('quiz-score').textContent = `Score: ${quizScore}/${totalQuestions}`;
    });
  });
  
  // Next question button
  nextQuestionBtn.addEventListener('click', () => {
    // Move to next question
    currentQuizIndex = (currentQuizIndex + 1) % quizQuestions.length;
    updateQuizQuestion();
  });
}

// Update quiz question
function updateQuizQuestion() {
  const currentQuestion = quizQuestions[currentQuizIndex];
  document.getElementById('quiz-question').textContent = currentQuestion.question;
  
  // Clear previous selections
  const quizOptions = document.querySelectorAll('.quiz-option');
  quizOptions.forEach((option, index) => {
    option.textContent = currentQuestion.options[index];
    option.className = 'quiz-option';
  });
  
  // Reset feedback
  document.getElementById('quiz-feedback').className = 'quiz-feedback';
}

// Create audio preview
function createAudioPreview(audioURL) {
  const audioPreviewContainer = document.getElementById('audio-preview-container');
  audioPreviewContainer.innerHTML = '';
  
  const audio = document.createElement('audio');
  audio.src = audioURL;
  audio.controls = true;
  audio.classList.add('audio-preview');
  
  audioPreviewContainer.appendChild(audio);
}
