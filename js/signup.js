const API_BASE_URL = 'http://localhost:8080';

const CHECK_EMAIL_API_URL = `${API_BASE_URL}/api/users/check-email`;
const CHECK_NICKNAME_API_URL = `${API_BASE_URL}/api/users/check-nickname`;
const SIGNUP_API_URL = `${API_BASE_URL}/api/users/signup`;

const nicknameInput = document.getElementById('nickname');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const passwordConfirmInput = document.getElementById('passwordConfirm');

const nicknameError = document.getElementById('nickname-error');
const emailError = document.getElementById('email-error');
const passwordError = document.getElementById('password-error');
const passwordConfirmError = document.getElementById('passwordConfirm-error');

const registerButton = document.getElementById('register-button');
const form = document.getElementById('signup-form');

const backButton = document.getElementById('back-button');


let isEmailValid = false;
let isPasswordValid = false;
let isPasswordConfirmValid = false;
let isNicknameValid = false;

backButton.addEventListener('click', function () {
  location.href = "login.html";
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

let nicknameAbortController = null;

function validateNickname(value) {
    const regex = /^[가-힣A-Za-z0-9_]+$/;
    return regex.test(value);
}
function includesWhitespace(value) {
    const regex = /\s/;
    return regex.test(value);
}

nicknameInput.addEventListener('blur', async function () {
    const nicknameValue = nicknameInput.value.trim();

    if (nicknameValue === '') {
        showMessage(nicknameError, '*닉네임을 입력해주세요.');
        nicknameInput.setAttribute('aria-invalid', 'true');
        isNicknameValid = false;
        checkFormValid();
        return;
    }
    if (includesWhitespace(nicknameValue)) {
        showMessage(nicknameError, '*띄어쓰기를 없애주세요.');
        nicknameInput.setAttribute('aria-invalid', 'true');
        isNicknameValid = false;
        checkFormValid();
        return;
    }
    if (nicknameValue.length > 10) {
        showMessage(nicknameError, "*닉네임은 최대 10자까지 작성 가능합니다.");
        nicknameInput.setAttribute('aria-invalid', 'true');
        isNicknameValid = false;
        checkFormValid();
        return;
    }
    if (!validateNickname(nicknameValue)) {
        showMessage(nicknameError, '*닉네임은 한글/영문/숫자/밑줄(_)만 작성 가능합니다.');
        nicknameInput.setAttribute('aria-invalid', 'true');
        isNicknameValid = false;
        checkFormValid();
        return;
    }

    if (nicknameAbortController) nicknameAbortController.abort();
    nicknameAbortController = new AbortController();

    showMessage(nicknameError, '닉네임 중복 확인 중...', '#666');

    try {
        const exists = await isNicknameDuplicate(nicknameValue, nicknameAbortController.signal);

        if (exists) {
            showMessage(nicknameError, '*중복된 닉네임입니다.');
            nicknameInput.setAttribute('aria-invalid', 'true');
            isNicknameValid = false;
            checkFormValid();
        } else {
            showMessage(nicknameError, '*사용 가능한 닉네임입니다.', '#2a8a2a');
            nicknameInput.setAttribute('aria-invalid', 'false');
            isNicknameValid = true;
            checkFormValid();
        }
    } catch (err) {
        if (err.name === 'AbortError') return;
        showMessage(nicknameError, '*중복 확인에 실패했어요. 잠시 후 다시 시도해주세요.', '#d33');
        nicknameInput.setAttribute('aria-invalid', 'true');
        isNicknameValid = false;
        checkFormValid();
    }
});

function validateEmail(value) {
    const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return regex.test(value);
}

async function isEmailDuplicate(email, signal) {
    const url = CHECK_EMAIL_API_URL + "?email=" + encodeURIComponent(email);

    const response = await fetch(url, {
        method: "GET",
        signal,
    });

    if (!response.ok) throw new Error("email duplicate check error")

    const result = await response.json();

    return result.data;
}

async function isNicknameDuplicate(nickname, signal) {
    const url = CHECK_NICKNAME_API_URL + "?nickname=" + encodeURIComponent(nickname);

    const response = await fetch(url, {
        method: "GET",
        signal,
    });

    if (!response.ok) throw new Error("nickname duplicate check error")

    const result = await response.json();

    return result.data;
}

let emailAbortController = null;

emailInput.addEventListener('blur', async function () {
    const emailValue = emailInput.value.trim();

    if (emailValue === '') {
        showMessage(emailError, '*이메일을 입력해주세요.');
        emailInput.setAttribute('aria-invalid', 'true');
        isEmailValid = false;
        checkFormValid();
        return;
    }
    if (!validateEmail(emailValue)) {
        showMessage(emailError, '*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)');
        emailInput.setAttribute('aria-invalid', 'true');
        isEmailValid = false;
        checkFormValid();
        return;
    }

    if (emailAbortController) emailAbortController.abort();
    emailAbortController = new AbortController();

    showMessage(emailError, '이메일 중복 확인 중...', '#666');

    try {
        const exists = await isEmailDuplicate(emailValue, emailAbortController.signal);

        if (exists) {
            showMessage(emailError, '*중복된 이메일입니다.');
            emailInput.setAttribute('aria-invalid', 'true');
            isEmailValid = false;
            checkFormValid();
        } else {
            showMessage(emailError, '*사용 가능한 이메일입니다.', '#2a8a2a');
            emailInput.setAttribute('aria-invalid', 'false');
            isEmailValid = true;
            checkFormValid();
        }
    } catch (err) {
        if (err.name === 'AbortError') return;
        showMessage(emailError, '*중복 확인에 실패했어요. 잠시 후 다시 시도해주세요.', '#d33');
        emailInput.setAttribute('aria-invalid', 'true');
        isEmailValid = false;
        checkFormValid();
    }
});

let lastPasswordValue = '';

function validatePassword(value) {
    if (value.length < 8 || value.length > 20)
        return false;

    const upper = /[A-Z]/;
    const lower = /[a-z]/;
    const number = /[0-9]/;
    const special = /[!@#$%^&*]/;
    return upper.test(value) && lower.test(value) && number.test(value) && special.test(value);
}

passwordInput.addEventListener('blur', function () {
    const passwordValue = passwordInput.value.trim();
    const passwordConfirm = passwordConfirmInput.value.trim();

    if (passwordValue === '') {
        showMessage(passwordError, '*비밀번호를 입력해주세요.');
        passwordInput.setAttribute('aria-invalid', 'true');
        isPasswordValid = false;
        checkFormValid();
        return;
    }
    if (!validatePassword(passwordValue)) {
        showMessage(passwordError, '*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.');
        passwordInput.setAttribute('aria-invalid', 'true');
        isPasswordValid = false;
        checkFormValid();
        return;
    }

    passwordInput.setAttribute('aria-invalid', 'false');
    hideMessage(passwordError);
    isPasswordValid = true;
    if (passwordValue !== lastPasswordValue) {
        isPasswordConfirmValid = false;
        if (!(passwordConfirm === ''))
            showMessage(passwordConfirmError, '*비밀번호가 일치하지 않습니다.');
        lastPasswordValue = passwordValue;
        checkFormValid();
    }
    checkFormValid();
});

passwordConfirmInput.addEventListener('blur', function () {
    const password = passwordInput.value.trim();
    const passwordConfirm = passwordConfirmInput.value.trim();

    if (passwordConfirm === '') {
        showMessage(passwordConfirmError, '*비밀번호를 한 번 더 입력해주세요.');
        passwordConfirmInput.setAttribute('aria-invalid', 'true');
        isPasswordConfirmValid = false;
        checkFormValid();
        return;
    }
    if (passwordConfirm !== password) {
        showMessage(passwordConfirmError, '*비밀번호가 일치하지 않습니다.');
        passwordConfirmInput.setAttribute('aria-invalid', 'true');
        isPasswordConfirmValid = false;
        checkFormValid();
        return;
    }
    passwordConfirmInput.setAttribute('aria-invalid', 'false');
    hideMessage(passwordConfirmError);
    isPasswordConfirmValid = true;
    checkFormValid();
});

function checkFormValid() {
    if (isEmailValid && isPasswordValid && isPasswordConfirmValid && isNicknameValid) {
        registerButton.disabled = false;
        registerButton.classList.add('primary-button--active');
    } else {
        registerButton.disabled = true;
        registerButton.classList.remove('primary-button--active');
    }
}


form.addEventListener('submit', function (event) {
  event.preventDefault();

  const signupPayload = {
    nickname: nicknameInput.value.trim(),
    email: emailInput.value.trim(),
    password: passwordInput.value    
  };

  fetch(SIGNUP_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(signupPayload)
  })
    .then(response => {
      if(response.ok)
        return response.json();
      else
        throw new Error("error");
    })
    .then(result => {
      location.href = "login.html";
    })
    .catch(error => {
      alert("회원가입에 실패했습니다. 다시 시도해주세요.");
    });
});