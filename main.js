/* ============================================================
   EverAfter Wedding Planner — Shared JavaScript
   ============================================================ */

/* ----- Page loader ----- */
window.addEventListener('load', () => {
  const loader = document.getElementById('page-loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 500);
  }
});

/* ----- Dark mode toggle ----- */
(function initTheme() {
  const saved = localStorage.getItem('everafter-theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
  else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('everafter-theme', next);
  updateThemeIcon();
}

function updateThemeIcon() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.textContent = isDark ? '☀' : '☾';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateThemeIcon();
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });

  /* ----- Navbar scroll state ----- */
  const navbar = document.querySelector('.navbar-custom');
  if (navbar) {
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ----- Set active nav link ----- */
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path) link.classList.add('active');
  });

  /* ----- Scroll to top ----- */
  const scrollBtn = document.getElementById('scroll-top');
  if (scrollBtn) {
    window.addEventListener('scroll', () => {
      scrollBtn.classList.toggle('show', window.scrollY > 400);
    }, { passive: true });
    scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ----- Reveal on scroll ----- */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  /* ----- Animated counters ----- */
  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.counter, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 1800;
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = target.toLocaleString() + suffix;
        };
        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(c => counterObserver.observe(c));
  }

  /* ----- Footer year ----- */
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----- Appointment Form Backend Integration ----- */
  const appointmentForm = document.getElementById('appointmentForm');
  if (appointmentForm) {
    const formSuccess = document.getElementById('formSuccess');
    const formSuccessText = document.getElementById('formSuccessText');
    const submitBtn = document.getElementById('submitBtn');
    const today = new Date().toISOString().split('T')[0];

    appointmentForm.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('blur', () => {
        if (field.hasAttribute('required') && !field.value.trim() && field.type !== 'checkbox') {
          field.classList.add('is-invalid');
        } else if (field.value.trim()) {
          field.classList.remove('is-invalid');
        }
      });
    });

    appointmentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (formSuccess) formSuccess.classList.remove('show');

      let valid = true;
      const fields = appointmentForm.querySelectorAll('input[required], select[required], textarea[required], input[type="checkbox"][required]');

      fields.forEach(field => {
        field.classList.remove('is-invalid');
        if (field.type === 'checkbox') {
          if (!field.checked) { field.classList.add('is-invalid'); valid = false; }
        } else if (!field.value.trim()) {
          field.classList.add('is-invalid'); valid = false;
        } else if (field.type === 'email') {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) { field.classList.add('is-invalid'); valid = false; }
        } else if (field.type === 'tel') {
          if (!/^[0-9 +()\-]{7,}$/.test(field.value)) { field.classList.add('is-invalid'); valid = false; }
        } else if (field.minLength && field.value.length < field.minLength) {
          field.classList.add('is-invalid'); valid = false;
        } else if (field.type === 'number') {
          const n = parseInt(field.value, 10);
          if (isNaN(n) || n < 1 || n > 1000) { field.classList.add('is-invalid'); valid = false; }
        }
      });

      const weddingDate = document.getElementById('weddingDate');
      if (weddingDate && weddingDate.value && weddingDate.value < today) {
        weddingDate.classList.add('is-invalid'); valid = false;
      }

      const message = document.getElementById('message');
      if (message && message.value.length > 500) {
        message.classList.add('is-invalid'); valid = false;
      }

      if (!valid) return;

      submitBtn.disabled = true;
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Submitting Request...';

      const firstName = document.getElementById('firstName').value.trim();
      const lastName = document.getElementById('lastName').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const eventDate = weddingDate.value;
      const guestCount = parseInt(document.getElementById('guestCount').value, 10) || 0;
      const pkg = document.getElementById('package').value;
      const consultMode = document.getElementById('consultMode').value;
      const vision = message ? message.value.trim() : '';

      const notesCombined = `Package: ${pkg} | Mode: ${consultMode}${vision ? ' | Vision: ' + vision : ''}`;

      const payload = {
        name: `${firstName} ${lastName}`,
        email,
        phone,
        eventDate,
        guestCount,
        notes: notesCombined
      };

      try {
        const response = await fetch('http://localhost:5000/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          if (formSuccessText) {
            formSuccessText.textContent = "Thank you! Your appointment request has been saved. We'll contact you within 24 hours.";
          }
          if (formSuccess) formSuccess.classList.add('show');
          appointmentForm.reset();
          if (formSuccess) formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          alert(`Booking Error: ${result.message || 'Failed to submit appointment.'}`);
        }
      } catch (err) {
        console.error('API Error:', err);
        alert('Server unreachable. Please ensure the backend is running at http://localhost:5000.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  /* ----- Contact Form Backend Integration ----- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const contactSuccess = document.getElementById('contactSuccess');
    const contactSuccessText = document.getElementById('contactSuccessText');
    const cSubmitBtn = document.getElementById('cSubmitBtn');

    contactForm.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('input', () => field.classList.remove('is-invalid'));
    });

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (contactSuccess) contactSuccess.classList.remove('show');

      let valid = true;
      const fields = contactForm.querySelectorAll('[required]');

      fields.forEach(field => {
        field.classList.remove('is-invalid');
        if (field.type === 'email') {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) { field.classList.add('is-invalid'); valid = false; }
        } else if (field.type === 'tel' && field.value) {
          if (!/^[0-9 +()\-]{7,}$/.test(field.value)) { field.classList.add('is-invalid'); valid = false; }
        } else if (field.minLength && field.value.trim().length < field.minLength) {
          field.classList.add('is-invalid'); valid = false;
        } else if (!field.value.trim()) {
          field.classList.add('is-invalid'); valid = false;
        }
      });

      if (!valid) return;

      cSubmitBtn.disabled = true;
      const originalText = cSubmitBtn.textContent;
      cSubmitBtn.textContent = 'Sending Message...';

      const name = document.getElementById('cName').value.trim();
      const email = document.getElementById('cEmail').value.trim();
      const phone = document.getElementById('cPhone').value.trim();
      const subject = document.getElementById('cSubject').value;
      const rawMessage = document.getElementById('cMessage').value.trim();

      const messageCombined = phone ? `${rawMessage}\n\nPhone: ${phone}` : rawMessage;

      const payload = {
        name,
        email,
        subject,
        message: messageCombined
      };

      try {
        const response = await fetch('http://localhost:5000/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          if (contactSuccessText) {
            contactSuccessText.textContent = "Thank you for reaching out! Your message has been sent successfully. We'll get back to you within 24 hours.";
          }
          if (contactSuccess) contactSuccess.classList.add('show');
          contactForm.reset();
          if (contactSuccess) contactSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          alert(`Submission Error: ${result.message || 'Failed to send message.'}`);
        }
      } catch (err) {
        console.error('Contact API Error:', err);
        alert('Server unreachable. Please ensure the backend is running at http://localhost:5000.');
      } finally {
        cSubmitBtn.disabled = false;
        cSubmitBtn.textContent = originalText;
      }
    });
  }
});