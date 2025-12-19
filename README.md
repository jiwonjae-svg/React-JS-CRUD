# React CRUD 게시판

React JS로 구현한 완전한 CRUD(Create, Read, Update, Delete) 기능을 가진 게시판 애플리케이션입니다.

## 주요 기능

- ✅ **게시글 작성(Create)**: 제목, 작성자, 내용을 입력하여 새 게시글 작성
- ✅ **게시글 조회(Read)**: 게시글 목록 보기 및 상세 내용 조회
- ✅ **게시글 수정(Update)**: 기존 게시글의 제목과 내용 수정
- ✅ **게시글 삭제(Delete)**: 게시글 삭제 기능
- 📊 조회수 자동 증가
- 🎨 반응형 디자인 (모바일/태블릿/데스크톱)
- 💜 모던한 그라디언트 UI

## 프로젝트 구조

```
SNS2/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    ├── index.css
    └── components/
        ├── PostList.jsx
        ├── PostList.css
        ├── PostDetail.jsx
        ├── PostDetail.css
        ├── PostForm.jsx
        └── PostForm.css
```

## 설치 및 실행

1. **의존성 설치**
```bash
npm install
```

2. **개발 서버 실행**
```bash
npm run dev
```

3. **브라우저에서 확인**
- 터미널에 표시되는 URL(보통 http://localhost:5173)로 접속

## 사용 기술

- **React 18**: UI 라이브러리
- **Vite**: 빌드 도구
- **CSS3**: 스타일링 (Flexbox, Grid, Gradient)

## 사용 방법

1. **게시글 목록 보기**: 메인 페이지에서 모든 게시글을 테이블 형태로 확인
2. **게시글 작성**: '글쓰기' 버튼 클릭 → 폼 작성 → '작성' 버튼 클릭
3. **게시글 상세보기**: 게시글 제목 클릭
4. **게시글 수정**: 상세보기에서 '수정' 버튼 클릭 → 내용 수정 → '수정' 버튼 클릭
5. **게시글 삭제**: 목록 또는 상세보기에서 '삭제' 버튼 클릭

## 특징

- 📱 **반응형 디자인**: 모든 화면 크기에 최적화
- 🎯 **직관적인 UX**: 간단하고 명확한 사용자 인터페이스
- ⚡ **빠른 성능**: Vite를 사용한 빠른 개발 환경
- 💾 **로컬 상태 관리**: React Hooks를 사용한 효율적인 상태 관리
