const dotenv = require('dotenv');
dotenv.config(); // 가장 먼저 환경 변수 로드

// 환경 변수 로드 확인 (디버깅용)
console.log('🔍 환경 변수 확인:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ 설정됨' : '❌ 없음');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ 설정됨' : '❌ 없음');
console.log('GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID ? '✅ 설정됨' : '❌ 없음');
console.log('GITHUB_CLIENT_SECRET:', process.env.GITHUB_CLIENT_SECRET ? '✅ 설정됨' : '❌ 없음');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIO = require('socket.io');
const session = require('express-session');
const passport = require('./config/passport'); // dotenv.config() 이후에 로드

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// 미들웨어
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 세션 설정
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24시간
  }
}));

// Passport 초기화
app.use(passport.initialize());
app.use(passport.session());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100 // 최대 100 요청
});
app.use('/api/', limiter);

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/community-board', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB 연결 성공'))
.catch(err => console.error('❌ MongoDB 연결 실패:', err));

// Socket.IO 설정
io.on('connection', (socket) => {
  console.log('✅ 새로운 클라이언트 연결:', socket.id);

  socket.on('join-board', (boardId) => {
    socket.join(boardId);
    console.log(`사용자 ${socket.id}가 ${boardId} 게시판에 입장`);
  });

  socket.on('leave-board', (boardId) => {
    socket.leave(boardId);
  });

  socket.on('new-post', (data) => {
    io.to(data.category).emit('post-created', data);
  });

  socket.on('new-comment', (data) => {
    io.to(`post-${data.postId}`).emit('comment-added', data);
  });

  socket.on('disconnect', () => {
    console.log('❌ 클라이언트 연결 해제:', socket.id);
  });
});

// 라우트
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const userRoutes = require('./routes/users');
const uploadRoutes = require('./routes/upload');
const emailRoutes = require('./routes/email');

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/email', emailRoutes);

// OAuth 라우트
const jwt = require('jsonwebtoken');

// Google OAuth
app.get('/api/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/api/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login` }),
  (req, res) => {
    // JWT 토큰 생성
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    const refreshToken = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // 프론트엔드로 리다이렉트 (토큰 포함)
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}&refreshToken=${refreshToken}`);
  }
);

// GitHub OAuth
app.get('/api/auth/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

app.get('/api/auth/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login` }),
  (req, res) => {
    // JWT 토큰 생성
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    const refreshToken = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // 프론트엔드로 리다이렉트 (토큰 포함)
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}&refreshToken=${refreshToken}`);
  }
);

// 테스트 라우트
app.get('/', (req, res) => {
  res.json({ message: '🚀 Community Board API Server' });
});

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '서버 오류가 발생했습니다.' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
});

module.exports = { app, io };
