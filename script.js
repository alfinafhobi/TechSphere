$(document).ready(function () {
    const form = $('#registrationForm');
    const successView = $('#successMessage');

    // Regular Expressions for Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Basic phone validation (allowing digits, spaces, plus, hyphens, and parenthesis)
    const phoneRegex = /^[\d\+\-\(\)\s]{10,20}$/;

    // Error UI management
    function showError(inputElement, message) {
        const group = inputElement.closest('.input-group');
        group.addClass('error');
        group.find('.error-message').text(message);
    }

    function clearError(inputElement) {
        const group = inputElement.closest('.input-group');
        group.removeClass('error');
        group.find('.error-message').text('');
    }

    // Field Validator
    function validateField(inputElement) {
        const id = inputElement.attr('id');
        const value = inputElement.val() ? inputElement.val().trim() : '';
        let isValid = true;

        // Skip validation if the field is optional
        if (id === 'department') return true;

        clearError(inputElement);

        switch (id) {
            case 'fullName':
                if (value === '') {
                    showError(inputElement, 'Full Name is required');
                    isValid = false;
                } else if (value.length < 3) {
                    showError(inputElement, 'Please enter your full name');
                    isValid = false;
                }
                break;
            case 'email':
                if (value === '') {
                    showError(inputElement, 'Email address is required');
                    isValid = false;
                } else if (!emailRegex.test(value)) {
                    showError(inputElement, 'Please enter a valid email format');
                    isValid = false;
                }
                break;
            case 'phone':
                if (value === '') {
                    showError(inputElement, 'Phone number is required');
                    isValid = false;
                } else if (!phoneRegex.test(value)) {
                    showError(inputElement, 'Please enter a valid phone number');
                    isValid = false;
                }
                break;
            case 'college':
                if (value === '') {
                    showError(inputElement, 'College / Organization is required');
                    isValid = false;
                }
                break;
            case 'year':
                if (!value) {
                    showError(inputElement, 'Please select your year of study');
                    isValid = false;
                }
                break;
            case 'gender':
                if (!value) {
                    showError(inputElement, 'Please specify your gender');
                    isValid = false;
                }
                break;
            case 'category':
                if (!value) {
                    showError(inputElement, 'Please select an event category');
                    isValid = false;
                }
                break;
        }

        return isValid;
    }

    // Real-time validation
    $('input, select').on('input change blur', function () {
        validateField($(this));
    });

    // Reset button functionality
    $('#resetBtn').on('click', function (e) {
        $('.input-group').removeClass('error');
        $('.error-message').text('');
        // Let the default form reset happen naturally
    });

    // Main form submission
    form.on('submit', function (e) {
        e.preventDefault();

        let formIsValid = true;
        const requiredFields = ['fullName', 'email', 'phone', 'college', 'year', 'gender', 'category'];

        // Validate all fields
        requiredFields.forEach(function (id) {
            const input = $('#' + id);
            if (!validateField(input)) {
                formIsValid = false;
            }
        });

        if (formIsValid) {
            const submitBtn = $('#submitBtn');
            const originalText = submitBtn.text();

            // Loading state UX
            submitBtn.html('Processing <span style="display:inline-block; animation: pulse 1s infinite;">...</span>');
            submitBtn.prop('disabled', true);

            // Gather form data
            const formData = {
                fullName: $('#fullName').val().trim(),
                email: $('#email').val().trim(),
                phone: $('#phone').val().trim(),
                college: $('#college').val().trim(),
                department: $('#department').val().trim(),
                year: $('#year').val(),
                gender: $('#gender').val(),
                category: $('#category').val()
            };

            // Send network request using jQuery AJAX
            $.ajax({
                url: '/register',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(formData),
                success: function (data) {
                    if (data.success) {
                        // Hide form and show success message with smooth transition
                        form.fadeOut(300, function () {
                            successView.removeClass('hidden').hide().fadeIn(400);
                        });
                    }
                },
                error: function (xhr) {
                    console.error('Error:', xhr);
                    let errorMessage = 'An error occurred during registration. Please try again.';

                    if (xhr.responseJSON && xhr.responseJSON.message) {
                        errorMessage = xhr.responseJSON.message;
                    }

                    // Show error under email if it's a duplicate
                    if (xhr.status === 409) {
                        showError($('#email'), errorMessage);
                        $('#email')[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                    } else {
                        // Show generic alert
                        alert('Registration failed: ' + errorMessage);
                    }
                },
                complete: function () {
                    // Reset button ready for next time
                    submitBtn.text(originalText);
                    submitBtn.prop('disabled', false);
                }
            });
        } else {
            // Shake effect for the first invalid field to call attention to it
            const firstInvalid = $('.input-group.error').first();
            if (firstInvalid.length) {
                firstInvalid[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Add a small shake animation if we want, currently it will just highlight the error cleanly.
            }
        }
    });

    // Handle "Register Another" button
    $('#registerAnother').on('click', function () {
        form[0].reset();

        // Remove validations
        $('.input-group').removeClass('error');

        // Transition back
        successView.fadeOut(300, function () {
            successView.addClass('hidden');
            form.fadeIn(400);

            // Scroll to top of the form smoothly
            $('.registration-section')[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
});
