const API_BASE_URL = 'http://localhost:8080';

const LOGIN_API_URL = `${API_BASE_URL}/api/auth/login`;


document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const loginError = document.getElementById('login-error');

    const loginButton = document.getElementById('login-button');
    const loginForm = document.getElementById('login-form');

    const backButton = document.getElementById('back-button');


    let isEmailValid = false;
    let isPasswordValid = false;

    backButton.addEventListener('click', function () {
        location.href = "index.html";
    });


    function showMessage(element, message, color = '#d33') {
        element.textContent = message;
        element.style.color = color;
        element.classList.add('show');
    }

    function hideMessage(element) {
        element.textContent = '';
        element.classList.remove('show');
    }

    function validateEmail(value) {
        const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        return regex.test(value);
    }

    async function requestLogin(email, password) {
        const loginPayload = {
            email,
            password
        };

        const response = await fetch(LOGIN_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginPayload),
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error("login fail")
        }

        const result = await response.json();

        return result.data;
    }

    emailInput.addEventListener('blur', function () {
        const emailValue = emailInput.value.trim();

        if (emailValue === '') {
            showMessage(emailError, '*이메일을 입력해주세요.');
            emailInput.setAttribute('aria-invalid', 'true');
            isEmailValid = false;
            checkFormValid();
            return;
        }
        if (!validateEmail(emailValue)) {
            showMessage(emailError, '*올바른 이메일 주소 형식을 입력해주세요.(예: example@example.com)');
            emailInput.setAttribute('aria-invalid', 'true');
            isEmailValid = false;
            checkFormValid();
            return;
        }
        emailInput.setAttribute('aria-invalid', 'false');
        hideMessage(emailError);
        isEmailValid = true;
        checkFormValid();

    });

    passwordInput.addEventListener('blur', function () {
        const passwordValue = passwordInput.value.trim();

        if (passwordValue === '') {
            showMessage(passwordError, '*비밀번호를 입력해주세요.');
            passwordInput.setAttribute('aria-invalid', 'true');
            isPasswordValid = false;
            checkFormValid();
            return;
        }
        passwordInput.setAttribute('aria-invalid', 'false');
        hideMessage(passwordError);
        isPasswordValid = true;
        checkFormValid();
    });

    function checkFormValid() {
        if (isEmailValid && isPasswordValid) {
            loginButton.disabled = false;
            loginButton.classList.add('primary-button--active');
        } else {
            loginButton.disabled = true;
            loginButton.classList.remove('primary-button--active');
        }
    }

    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!isEmailValid || !isPasswordValid)
            return;

        try {
            const userData = await requestLogin(email, password);

            localStorage.setItem('accessToken', userData.accessToken);
            localStorage.setItem('currentUser', JSON.stringify({id: userData.id, email: userData.email, nickname: userData.nickname}));


            location.href = "main.html";
        } catch (e) {
            console.error(e);
            showMessage(passwordError, '*아이디 또는 비밀번호를 확인해주세요.');
        }
    })
});

