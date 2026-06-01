document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Theme Toggle Logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    const iconDark = themeToggleBtn.querySelector('.icon-dark');
    const iconLight = themeToggleBtn.querySelector('.icon-light');

    // Retrieve saved theme preference or use system default
    const savedTheme = localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    // Apply initial theme
    setTheme(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        if (theme === 'dark') {
            iconDark.style.display = 'none';
            iconLight.style.display = 'block';
        } else {
            iconDark.style.display = 'block';
            iconLight.style.display = 'none';
        }
    }

    // 3. Mobile Menu Toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const iconOpen = mobileMenuToggle.querySelector('.icon-open');
    const iconClose = mobileMenuToggle.querySelector('.icon-close');

    mobileMenuToggle.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('mobile-open');

        if (isOpen) {
            iconOpen.style.display = 'none';
            iconClose.style.display = 'block';
        } else {
            iconOpen.style.display = 'block';
            iconClose.style.display = 'none';
        }
    });

    // Close menu when a navigation link is clicked
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('mobile-open')) {
                navMenu.classList.remove('mobile-open');
                iconOpen.style.display = 'block';
                iconClose.style.display = 'none';
            }
        });
    });

    // 4. Scroll Progress & Sticky Header Style
    const scrollProgress = document.getElementById('scroll-progress');
    const header = document.getElementById('main-header');

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        scrollProgress.style.width = `${scrollPercent}%`;

        // Add class to header when scrolled past threshold
        if (scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 5. Scrollspy - Highlight Active Section in Navbar
    const sections = document.querySelectorAll('section[id]');

    function scrollspy() {
        const scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120; // accounting for sticky header height
            const sectionId = current.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelector(`.nav-link[href*=${sectionId}]`)?.classList.add('active');
            } else {
                document.querySelector(`.nav-link[href*=${sectionId}]`)?.classList.remove('active');
            }
        });
    }

    window.addEventListener('scroll', scrollspy);

    // 6. First Month Timeline Toggles
    const timelineSteps = document.querySelectorAll('.timeline-step');
    const timelinePanes = document.querySelectorAll('.timeline-content-pane');

    timelineSteps.forEach(step => {
        step.addEventListener('click', () => {
            // Remove active from all steps
            timelineSteps.forEach(s => s.classList.remove('active'));
            // Add active to current step
            step.classList.add('active');

            const week = step.getAttribute('data-week');

            // Hide all panes
            timelinePanes.forEach(pane => pane.classList.remove('active'));
            // Show corresponding pane
            const targetPane = document.getElementById(`pane-week-${week}`);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });

    // 7. Packing Checklist - Local Storage Persistence
    const packingGrid = document.getElementById('packing-grid');
    const addChecklistForm = document.getElementById('add-checklist-form');
    const customChecklistInput = document.getElementById('custom-checklist-input');
    const customPackingItemsKey = 'customPackingItems';

    function bindChecklistBox(box) {
        const isChecked = localStorage.getItem(box.id) === 'true';
        box.checked = isChecked;

        box.addEventListener('change', () => {
            localStorage.setItem(box.id, box.checked);
        });
    }

    function createChecklistItem(item) {
        const label = document.createElement('label');
        label.className = 'checklist-item checklist-item-custom';

        label.innerHTML = `
            <input type="checkbox" id="${item.id}" class="checklist-checkbox">
            <span class="checkbox-custom"></span>
            <div class="checklist-text">
                <strong></strong>
                <p>Added by you. Tick it off when packed.</p>
            </div>
        `;

        label.querySelector('strong').textContent = item.name;
        return label;
    }

    function getCustomPackingItems() {
        try {
            return JSON.parse(localStorage.getItem(customPackingItemsKey)) || [];
        } catch {
            return [];
        }
    }

    function saveCustomPackingItems(items) {
        localStorage.setItem(customPackingItemsKey, JSON.stringify(items));
    }

    if (packingGrid) {
        getCustomPackingItems().forEach(item => {
            packingGrid.appendChild(createChecklistItem(item));
        });

        packingGrid.querySelectorAll('.checklist-checkbox').forEach(bindChecklistBox);
    }

    if (addChecklistForm && customChecklistInput && packingGrid) {
        addChecklistForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const itemName = customChecklistInput.value.trim();
            if (!itemName) return;

            const customItems = getCustomPackingItems();
            const newItem = {
                id: `custom-pack-item-${Date.now()}`,
                name: itemName
            };

            customItems.push(newItem);
            saveCustomPackingItems(customItems);

            const customItemElement = createChecklistItem(newItem);
            packingGrid.appendChild(customItemElement);
            bindChecklistBox(customItemElement.querySelector('.checklist-checkbox'));
            customChecklistInput.value = '';
        });
    }

    // 8. Interactive Club Finder Quiz
    const quizBox = document.getElementById('quiz-box');
    const quizSlides = document.querySelectorAll('.quiz-question-slide');
    const quizResult = document.getElementById('quiz-result');
    const quizResultClub = document.getElementById('quiz-result-club');
    const quizResultDesc = document.getElementById('quiz-result-desc');
    const quizResetBtn = document.getElementById('quiz-reset-btn');

    let quizAnswers = [];

    quizBox.addEventListener('click', (e) => {
        const optionBtn = e.target.closest('.btn-quiz-option');
        if (!optionBtn) return;

        const value = optionBtn.getAttribute('data-value');
        quizAnswers.push(value);

        const currentSlide = optionBtn.closest('.quiz-question-slide');
        const currentQNum = parseInt(currentSlide.getAttribute('data-question'), 10);
        const nextSlide = quizBox.querySelector(`.quiz-question-slide[data-question="${currentQNum + 1}"]`);

        // Hide current slide
        currentSlide.style.display = 'none';

        if (nextSlide) {
            nextSlide.style.display = 'block';
        } else {
            // Show results
            showQuizResults();
        }
    });

    quizResetBtn.addEventListener('click', () => {
        quizAnswers = [];
        quizResult.style.display = 'none';

        // Reset all questions display
        quizSlides.forEach((slide, idx) => {
            slide.style.display = idx === 0 ? 'block' : 'none';
        });
    });

    function showQuizResults() {
        quizResult.style.display = 'block';

        const primaryInterest = quizAnswers[0];
        const secondaryInterest = quizAnswers[1];

        const recommendations = {
            building: {
                building: {
                    club: 'ReLU',
                    description: 'You are drawn to logic-heavy building and serious problem solving. ReLU is a strong fit for machine learning, deep learning, algorithms, and collaborative AI practice.'
                },
                performing: {
                    club: 'Robotics Club - AVV Amaravati',
                    description: 'You like building things that can move, react, and show up in the real world. Robotics Club is where hardware experiments, automation ideas, and future robotics projects come alive.'
                },
                organizing: {
                    club: 'IEEE',
                    description: 'You enjoy technology and also like sharing ideas with a larger community. IEEE is ideal if you want projects, technical events, and a network of people advancing humanity through technology.'
                },
                competing: {
                    club: 'Chakravyuha',
                    description: 'You enjoy technical challenges with a competitive edge. Chakravyuha fits coding contests, hackathons, algorithmic puzzles, and developer growth.'
                },
                service: {
                    club: 'IEEE',
                    description: 'You want technology to create useful impact. IEEE is a great match for students who think beyond code and care about applying engineering for society.'
                }
            },
            performing: {
                building: {
                    club: 'Drishya',
                    description: 'You mix performance energy with production curiosity. Drishya is perfect for video editing, music production, scriptwriting, drama, and stage events.'
                },
                performing: {
                    club: 'Saptaswara & Nrityasparsh',
                    description: 'The performance stage is calling. Whether you sing, play keyboard, or dance, these clubs will put you near the center of campus cultural life.'
                },
                organizing: {
                    club: 'Drishya',
                    description: 'You have the event storyteller vibe. Drishya lets you work on posters, scripts, multimedia coverage, production, drama, and stage experiences.'
                },
                competing: {
                    club: 'Avisruta',
                    description: 'You thrive on energy, practice, and performance under pressure. Avisruta is the sports umbrella for students who want team spirit and competition.'
                },
                service: {
                    club: 'Drishya',
                    description: 'You can turn meaningful campus initiatives into stories people notice. Drishya is a strong fit for creative coverage, posters, videos, and stage communication.'
                }
            },
            organizing: {
                building: {
                    club: 'Prachurya',
                    description: 'You enjoy both building and bringing people together. Prachurya fits technical workshops, creative digital events, innovation meetups, and hands-on coding culture.'
                },
                performing: {
                    club: 'Drishya',
                    description: 'You care about how events look, sound, and feel. Drishya is the place for multimedia, arts, scriptwriting, production, drama, and stage event work.'
                },
                organizing: {
                    club: 'Avinya',
                    description: 'You have strong coordination, communication, and idea-building energy. Avinya fits debates, newsletters, creative writing, literary events, and leadership work.'
                },
                competing: {
                    club: 'Avisruta',
                    description: 'You sound like someone who can bring teams together around competition. Avisruta is the sports umbrella for campus tournaments and athletic events.'
                },
                service: {
                    club: 'Swachh Amrita',
                    description: 'You are drawn to responsibility, coordination, and visible campus impact. Swachh Amrita is ideal for environmental work and cleanliness initiatives.'
                }
            },
            competing: {
                building: {
                    club: 'Chakravyuha',
                    description: 'You like pressure, rankings, and technical problem solving. Chakravyuha is a natural fit for competitive programming, hackathons, and coding challenges.'
                },
                performing: {
                    club: 'Saptaswara & Nrityasparsh',
                    description: 'You enjoy high-energy moments and performing with confidence. Saptaswara and Nrityasparsh are great spaces for music, dance, and campus stages.'
                },
                organizing: {
                    club: 'Avisruta',
                    description: 'You combine competitive spirit with team coordination. Avisruta fits sports participation, tournament energy, and campus athletic culture.'
                },
                competing: {
                    club: 'Avisruta',
                    description: 'You thrive on competition, speed, and sweat. Avisruta manages sports divisions on campus, from courts and fields to indoor games.'
                },
                service: {
                    club: 'Swachh Amrita',
                    description: 'You like action-oriented teamwork with visible results. Swachh Amrita is a strong fit for student-led cleanliness and environmental drives.'
                }
            },
            service: {
                building: {
                    club: 'IEEE',
                    description: 'You want to connect technical thinking with real-world impact. IEEE gives you a community for technology, learning, and socially useful engineering ideas.'
                },
                performing: {
                    club: 'Drishya',
                    description: 'You can help meaningful campus work reach people through creative media. Drishya fits poster design, scripts, videos, production, and stage communication.'
                },
                organizing: {
                    club: 'Swachh Amrita',
                    description: 'You care about making the campus cleaner, greener, and better coordinated. Swachh Amrita is your best match for environmental leadership.'
                },
                competing: {
                    club: 'Swachh Amrita',
                    description: 'You like active teamwork and practical results. Swachh Amrita channels that drive into cleanliness, environmental awareness, and campus responsibility.'
                },
                service: {
                    club: 'Swachh Amrita',
                    description: 'You are clearly drawn to service and campus improvement. Swachh Amrita is the student-led initiative for environmental awareness and cleanliness.'
                }
            }
        };

        const result = recommendations[primaryInterest]?.[secondaryInterest] || {
            club: 'Chakravyuha',
            description: 'You seem curious about coding and problem solving. Chakravyuha welcomes freshers of all skill levels and is a good place to start your tech journey.'
        };

        quizResultClub.textContent = result.club;
        quizResultDesc.textContent = result.description;
    }

    // 9. Time Management Simulator
    const slideAcademics = document.getElementById('slide-academics');
    const slideClubs = document.getElementById('slide-clubs');
    const slideSleep = document.getElementById('slide-sleep');

    const valAcademics = document.getElementById('val-academics');
    const valClubs = document.getElementById('val-clubs');
    const valSleep = document.getElementById('val-sleep');

    const feedbackBox = document.getElementById('time-feedback-box');
    const feedbackText = document.getElementById('time-feedback-text');

    function updateTimeSimulation() {
        const hrsAcademics = parseInt(slideAcademics.value, 10);
        const hrsClubs = parseInt(slideClubs.value, 10);
        const hrsSleep = parseInt(slideSleep.value, 10);

        valAcademics.textContent = `${hrsAcademics}h`;
        valClubs.textContent = `${hrsClubs}h`;
        valSleep.textContent = `${hrsSleep}h`;

        const totalHoursUsed = hrsAcademics + hrsClubs + hrsSleep;
        const remainingHours = 24 - totalHoursUsed;

        let statusHTML = '';
        let feedback = '';

        if (hrsSleep < 6) {
            statusHTML = `<span class="text-red font-semibold"><i data-lucide="shield-alert"></i> Sleep Deprived!</span>`;
            feedback = `Sleeping only ${hrsSleep} hours will lead to physical burnout, short-term memory loss, and high stress levels during exam week. Seniors strongly advise maintaining at least 7 hours.`;
        } else if (hrsAcademics < 3) {
            statusHTML = `<span class="text-orange font-semibold"><i data-lucide="alert-circle"></i> Low Study Hours!</span>`;
            feedback = `Allocating only ${hrsAcademics} hours for study and labs might make class assignments build up fast. Try to aim for 4 to 6 hours (including lectures) to maintain a good grip on materials.`;
        } else if (hrsAcademics > 9) {
            statusHTML = `<span class="text-orange font-semibold"><i data-lucide="info"></i> Burnout Risk!</span>`;
            feedback = `Spending ${hrsAcademics} hours studying leaves very little time to make friends, join clubs, or discover hobbies. Don't make books your entire personality. Reduce it slightly and relax!`;
        } else if (hrsClubs > 5) {
            statusHTML = `<span class="text-orange font-semibold"><i data-lucide="users-2"></i> Club Overload!</span>`;
            feedback = `Allocating ${hrsClubs} hours daily to clubs is a lot in the first year. Make sure you don't compromise your classes and sleep. Remember: CGPA is hard to raise if it falls early.`;
        } else if (totalHoursUsed > 22) {
            statusHTML = `<span class="text-red font-semibold"><i data-lucide="battery-warning"></i> Exhausting Schedule!</span>`;
            feedback = `You are scheduling almost all 24 hours with high effort tasks. You have only ${remainingHours} hours left for meals, bath, transit, and socializing. Seniors say: relax your routine!`;
        } else {
            statusHTML = `<span class="text-success font-semibold"><i data-lucide="smile"></i> Balanced Routine!</span>`;
            feedback = `This schedule is highly sustainable. You have plenty of sleep (${hrsSleep}h) to stay sharp, healthy academic focus, and time for extracurriculars. You still have ${remainingHours}h left for meals and hanging out.`;
        }

        feedbackBox.innerHTML = `
            <div class="feedback-indicator">
                ${statusHTML}
            </div>
            <p id="time-feedback-text">${feedback}</p>
        `;

        // Recreate icons in dynamically updated box
        if (typeof lucide !== 'undefined') {
            lucide.createIcons({
                attrs: {
                    class: 'icon-inline'
                },
                nameAttr: 'data-lucide',
                node: feedbackBox
            });
        }
    }

    // Attach listeners to sliders
    [slideAcademics, slideClubs, slideSleep].forEach(slider => {
        slider.addEventListener('input', updateTimeSimulation);
    });

    // Initial feedback box fill
    updateTimeSimulation();

    // 10. FAQ Accordion Toggles
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            const isActive = item.classList.contains('active');

            // Close all items
            document.querySelectorAll('.faq-item').forEach(i => {
                i.classList.remove('active');
                i.querySelector('.faq-answer').style.maxHeight = null;
            });

            // Open clicked item if it was closed
            if (!isActive) {
                item.classList.add('active');
                const answer = item.querySelector('.faq-answer');
                // Set max-height to its scrollheight
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    // 11. PDF/Print Booklet Download Trigger
    const pdfBtnHeader = document.getElementById('pdf-download-header');
    const pdfBtnFooter = document.getElementById('pdf-download-footer');

    [pdfBtnHeader, pdfBtnFooter].forEach(btn => {
        btn.addEventListener('click', () => {
            // Close mobile menu if open
            if (navMenu.classList.contains('mobile-open')) {
                navMenu.classList.remove('mobile-open');
                iconOpen.style.display = 'block';
                iconClose.style.display = 'none';
            }

            // Trigger native print dialog
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            let y = 20;

            doc.setFontSize(22);
            doc.text("Campus Compass", 20, y);

            y += 15;
            doc.setFontSize(12);
            doc.text("A quick guide for freshers at Amrita Amaravati.", 20, y);

            y += 20;
            doc.setFontSize(16);
            doc.text("Week 1", 20, y);

            y += 10;
            doc.setFontSize(11);
            doc.text("• Attend orientation", 25, y);
            y += 8;
            doc.text("• Save important contacts", 25, y);
            y += 8;
            doc.text("• Locate your classrooms", 25, y);
            y += 8;
            doc.text("• Don't stress about clubs immediately", 25, y);

            y += 20;
            doc.setFontSize(16);
            doc.text("Academics", 20, y);

            y += 10;
            doc.setFontSize(11);
            doc.text("• Aim for a strong CGPA from Semester 1", 25, y);
            y += 8;
            doc.text("• Start DSA early", 25, y);
            y += 8;
            doc.text("• Build depth before chasing many topics", 25, y);
            y += 8;
            doc.text("• Learn Git and GitHub", 25, y);
            y += 12;
            doc.setFontSize(16);
            doc.text("Academic Survival Tips", 20, y);

            y += 10;
            doc.setFontSize(11);
            doc.text("• Prioritize high-credit courses", 25, y);
            y += 8;
            doc.text("• Treat assignments and internals as free marks", 25, y);
            y += 8;
            doc.text("• Practice previous year papers before exams", 25, y);
            y += 8;
            doc.text("• Consistency beats last-minute preparation", 25, y);
            y += 8;
            doc.text("• Build strong notes from Semester 1", 25, y);
            doc.addPage();

            y = 20;
            doc.setFontSize(16);
            doc.text("Hostel Life", 20, y);

            y += 10;
            doc.setFontSize(11);
            doc.text("• Apply for passes 24 hours in advance", 25, y);
            y += 8;
            doc.text("• Curfew is typically 8:30 PM", 25, y);
            y += 8;
            doc.text("• Gym facility available", 25, y);
            y += 8;
            doc.text("• Swipe while exiting and entering", 25, y);
            y += 15;
            doc.setFontSize(16);
            doc.text("Hostel Essentials", 20, y);

            y += 10;
            doc.setFontSize(11);
            doc.text("• Never forget your ID card", 25, y);
            y += 8;
            doc.text("• Apply for passes at least 24 hours early", 25, y);
            y += 8;
            doc.text("• Keep an extension board in your room", 25, y);
            y += 8;
            doc.text("• Save important faculty and warden contacts", 25, y);
            y += 8;
            doc.text("• Gym facility available for hostellers", 25, y);
            y += 20;
            doc.setFontSize(16);
            y += 15;
            doc.setFontSize(16);
            doc.text("Clubs & Activities", 20, y);

            y += 10;
            doc.setFontSize(11);
            doc.text("• Join 1-2 clubs that genuinely interest you", 25, y);
            y += 8;
            doc.text("• Talent Search is used for club recruitment", 25, y);
            y += 8;
            doc.text("• Chakravyuha - coding, hackathons, problem solving", 25, y);
            y += 8;
            doc.text("• Prachurya - workshops, innovation, bootcamps", 25, y);
            y += 8;
            doc.text("• Avisruta - sports and athletics", 25, y);
            doc.text("Senior Contacts", 20, y);

            y += 10;
            doc.setFontSize(11);
            doc.text("Kollipara VMK Mithra", 25, y);
            y += 8;
            doc.text("+91 70320 69306", 25, y);

            y += 15;
            doc.text("Medha Ganti", 25, y);
            y += 8;
            doc.text("+91 83174 58811", 25, y);
            y += 20;

            doc.setFontSize(16);
            doc.text("One Final Piece of Advice", 20, y);

            y += 10;
            doc.setFontSize(11);
            doc.text("Don't try to learn everything at once.", 25, y);
            y += 8;
            doc.text("Build a strong foundation in one area first.", 25, y);
            y += 8;
            doc.text("Stay consistent, attend classes, and enjoy college.", 25, y);

            doc.save("CampusCompass-Freshers-Guide.pdf");
        });
    });
});
