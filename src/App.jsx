import React, { useState } from 'react';
import PostList from './components/PostList';
import PostDetail from './components/PostDetail';
import PostForm from './components/PostForm';
import './App.css';

// 초기 샘플 데이터
const initialPosts = [
  {
    id: 1,
    title: '첫 번째 게시글입니다',
    author: '관리자',
    content: '안녕하세요! 이것은 첫 번째 게시글의 내용입니다.\n\nReact로 만든 CRUD 게시판입니다.',
    date: new Date('2025-12-15'),
    views: 42
  },
  {
    id: 2,
    title: 'React CRUD 게시판 사용법',
    author: '사용자1',
    content: '게시글 작성, 조회, 수정, 삭제 기능을 모두 사용할 수 있습니다.\n\n글쓰기 버튼을 눌러 새 게시글을 작성해보세요!',
    date: new Date('2025-12-16'),
    views: 28
  },
  {
    id: 3,
    title: '환영합니다!',
    author: '사용자2',
    content: '게시판에 오신 것을 환영합니다.\n\n자유롭게 글을 작성하고 수정, 삭제해보세요.',
    date: new Date('2025-12-17'),
    views: 15
  }
];

function App() {
  const [posts, setPosts] = useState(initialPosts);
  const [currentView, setCurrentView] = useState('list'); // 'list', 'detail', 'create', 'edit'
  const [selectedPost, setSelectedPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [nextId, setNextId] = useState(4);

  // 게시글 목록으로 이동
  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedPost(null);
    setEditingPost(null);
  };

  // 게시글 선택 (상세보기)
  const handleSelectPost = (id) => {
    const post = posts.find(p => p.id === id);
    if (post) {
      // 조회수 증가
      setPosts(posts.map(p => 
        p.id === id ? { ...p, views: p.views + 1 } : p
      ));
      setSelectedPost({ ...post, views: post.views + 1 });
      setCurrentView('detail');
    }
  };

  // 새 게시글 작성 페이지로 이동
  const handleCreateNew = () => {
    setCurrentView('create');
    setEditingPost(null);
  };

  // 게시글 수정 페이지로 이동
  const handleEditPost = (post) => {
    setEditingPost(post);
    setCurrentView('edit');
  };

  // 게시글 생성
  const handleCreatePost = (formData) => {
    const newPost = {
      id: nextId,
      title: formData.title,
      author: formData.author,
      content: formData.content,
      date: new Date(),
      views: 0
    };
    setPosts([newPost, ...posts]);
    setNextId(nextId + 1);
    setCurrentView('list');
  };

  // 게시글 수정
  const handleUpdatePost = (formData) => {
    setPosts(posts.map(post =>
      post.id === editingPost.id
        ? { ...post, title: formData.title, content: formData.content }
        : post
    ));
    setCurrentView('list');
    setEditingPost(null);
  };

  // 게시글 삭제
  const handleDeletePost = (id) => {
    setPosts(posts.filter(post => post.id !== id));
    setCurrentView('list');
    setSelectedPost(null);
  };

  return (
    <div className="app">
      <div className="container">
        {currentView === 'list' && (
          <PostList
            posts={posts}
            onSelectPost={handleSelectPost}
            onDeletePost={handleDeletePost}
            onCreateNew={handleCreateNew}
          />
        )}

        {currentView === 'detail' && (
          <PostDetail
            post={selectedPost}
            onEdit={handleEditPost}
            onBack={handleBackToList}
            onDelete={handleDeletePost}
          />
        )}

        {currentView === 'create' && (
          <PostForm
            onSubmit={handleCreatePost}
            onCancel={handleBackToList}
          />
        )}

        {currentView === 'edit' && (
          <PostForm
            post={editingPost}
            onSubmit={handleUpdatePost}
            onCancel={handleBackToList}
          />
        )}
      </div>
    </div>
  );
}

export default App;
