const API_BASE = "http://localhost:8080";

const API_USERS = `${API_BASE}/api/users`;
const API_CHALLENGES = `${API_BASE}/api/challenges`;

function setupHeader() {
  const logoLink = document.querySelector('.main-header__logo a');
  const mypageButton = document.querySelector('.main-header__mypage');
  const dropdown = document.getElementById('mypage-dropdown');
  const profileItem = document.getElementById('mypage-profile');
  const logoutItem = document.getElementById('mypage-logout');

  logoLink.addEventListener('click', (event) => {
    event.preventDefault();
    location.href = 'main.html';
  });

  mypageButton.addEventListener('click', () => {
    dropdown.classList.toggle('main-header__dropdown--open');
  });

  profileItem.addEventListener('click', () => {
    location.href = 'mypage.html';
  });

  logoutItem.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    location.href = 'login.html';
  });

  document.addEventListener('click', (event) => {
    if (
      mypageButton.contains(event.target) ||
      dropdown.contains(event.target)
    ) {
      return;
    }

    dropdown.classList.remove('main-header__dropdown--open');
  });
}


function updateTopBanner(challenges) {
    const bannerTitle = document.getElementById('banner-title');
    const bannerSubtitle = document.getElementById('banner-subtitle');
    const bannerAction = document.getElementById('banner-action');

    if (!challenges || challenges.length === 0) {
        bannerTitle.textContent = '아직 참여 중인 챌린지가 없어요.';
        bannerSubtitle.textContent = '어떤 챌린지가 있는지 살펴보러 갈까요?';

        bannerAction.onclick = () => {
            location.href = 'challenges.html';
        };

        return;
    }

    const notPostedToday = challenges.filter(c => !c.todayPosted);
    const section = document.getElementById('my-challenges-section');

    if (notPostedToday.length > 0) {
        bannerTitle.textContent = '오늘의 Up-Date를 공유해주세요!';
        bannerSubtitle.textContent = '아직 오늘의 인증을 작성하지 않은 챌린지가 있어요.';

        bannerAction.onclick = () => {
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        };
        return;
    }

    bannerTitle.textContent = '오늘의 Up-Date를 모두 완료했어요!';
    bannerSubtitle.textContent = '다른 사람들의 Up-Date를 보러 갈까요?';

    bannerAction.onclick = () => {
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    };
}


async function fetchMyChallenges(userId) {
    const response = await fetch(`${API_USERS}/${userId}/challenges`);

    if (!response.ok) {
        throw new Error(`참여중인 챌린지 목록을 불러오는데 실패했습니다. status: ${response.status}`);
    }

    const result = await response.json();

    return result.data;
}

function mapCategoryToKorean(category) {
    switch (category) {
        case 'STUDY':
            return '공부';
        case 'HEALTH':
            return '운동';
        case 'READING':
            return '독서';
        case 'LIFE':
            return '생활습관';
        case 'ETC':
            return '기타';
        default:
            return category ?? '';
    }
}

function formatDueDate(dueDate) {
    if (!dueDate) {
        return '마감일: 기한 없음';
    }

    const date = new Date(dueDate);
    if (Number.isNaN(date.getTime())) {
        return '마감일: 기한 없음';
    }

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');

    return `마감일: ${y}.${m}.${d}`;
}

function createMyChallengeCard(challenge) {
    const li = document.createElement('li');
    li.className = 'challenge-card';

    const left = document.createElement('div');
    left.className = 'challenge-card__left';

    const categoryEl = document.createElement('div');
    categoryEl.className = 'challenge-card__category';
    categoryEl.textContent = `#${mapCategoryToKorean(challenge.category)}`;
    left.appendChild(categoryEl);

    const titleEl = document.createElement('div');
    titleEl.className = 'challenge-card__title';
    titleEl.textContent = challenge.title;
    left.appendChild(titleEl);

    const metaEl = document.createElement('div');
    metaEl.className = 'challenge-card__meta';
    metaEl.textContent = formatDueDate(challenge.dueDate);
    left.appendChild(metaEl);

    li.appendChild(left);

    const right = document.createElement('div');
    right.className = 'challenge-card__right';

    const statusEl = document.createElement('span');
    statusEl.className = 'challenge-card__action';
    statusEl.textContent = challenge.todayPosted
        ? 'Up-Date 작성 완료'
        : 'Up-Date 작성하기';

    if (challenge.todayPosted) {
        statusEl.classList.add('challenge-card__action--done');
    }

    right.appendChild(statusEl);

    li.appendChild(right);

    li.addEventListener('click', () => {
        location.href = `/challenge-detail.html?challengeId=${challenge.challengeId}`;
    });

    return li;
}

function renderMyChallenges(challenges) {
    const challengeList = document.getElementById('my-challenges-list');
    const challengeEmpty = document.getElementById('my-challenges-empty');

    if (challenges.length === 0) {
        challengeEmpty.style.display = 'block';
        challengeList.style.display = 'none';
        return;
    }

    challengeEmpty.style.display = 'none';
    challengeList.style.display = 'block';

    challengeList.innerHTML = "";

    challenges.forEach(challenge => {
        const li = createMyChallengeCard(challenge);
        challengeList.appendChild(li);
    });
}


async function fetchRecommendedChallenges() {
    const RECOMMENDED_LIMIT = 4;
    const response = await fetch(`${API_CHALLENGES}`);

    if (!response.ok) {
        throw new Error(`추천 챌린지 목록을 불러오는데 실패했습니다. status: ${response.status}`);
    }

    const result = await response.json();
    const challenges = result.data;

    const activeChallenges = challenges.filter(c => c.state === 'active');
    return activeChallenges.slice(0, RECOMMENDED_LIMIT);
}

function createRecommendedChallengeCard(challenge) {
    const li = document.createElement('li');
    li.className = 'challenge-card challenge-card--recommended';

    const left = document.createElement('div');
    left.className = 'challenge-card__left';

    const categoryEl = document.createElement('div');
    categoryEl.className = 'challenge-card__category';
    categoryEl.textContent = `#${mapCategoryToKorean(challenge.category)}`;
    left.appendChild(categoryEl);

    const titleEl = document.createElement('div');
    titleEl.className = 'challenge-card__title';
    titleEl.textContent = challenge.title;
    left.appendChild(titleEl);

    const metaEl = document.createElement('div');
    metaEl.className = 'challenge-card__meta';
    metaEl.textContent = formatDueDate(challenge.dueDate);
    left.appendChild(metaEl);

    li.appendChild(left);

    li.addEventListener('click', () => {
        location.href = `challenge-detail.html?challengeId=${challenge.id}`;
    });

    return li;
}

function renderRecommendedChallenges(challenges) {
    const challengeList = document.getElementById('recommended-list');
    const challengeEmpty = document.getElementById('recommended-empty');
    const viewAllBtn = document.getElementById('recommended-view-all');

    viewAllBtn.onclick = () => {
        location.href = 'challenge-list.html';
    };

    if (!challenges || challenges.length === 0) {
        challengeEmpty.style.display = 'block';
        challengeList.style.display = 'none';
        return;
    }

    challengeEmpty.style.display = 'none';
    challengeList.style.display = 'block';
    challengeList.innerHTML = '';

    challenges.forEach((challenge) => {
        const li = createRecommendedChallengeCard(challenge);
        challengeList.appendChild(li);
    });
}


document.addEventListener('DOMContentLoaded', async () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        location.href = 'login.html';
        return;
    }

    setupHeader();
    
    const myChallenges = await fetchMyChallenges(currentUser.id);
    updateTopBanner(myChallenges);
    renderMyChallenges(myChallenges);

    const recommendedChallenges = await fetchRecommendedChallenges();
    renderRecommendedChallenges(recommendedChallenges);
});