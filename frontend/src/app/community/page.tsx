'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../stories/Sidebar";
import {User} from "../../types/users"
import Image from "next/image"

interface Post {
  id: number;
  user_id: number;
  content: string;
  image_url?: string;
  created_at: string;
  likes: number;
  likedByUser?: boolean;
}

export default function CommunityPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const sections = [
    { name: "chat", icon: "M3 9.5L12 3l9 6.5v9.5a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4H9v4a2 2 0 01-2 2H3a2 2 0 01-2-2V9.5z" },
    { name: "workouts", icon: "M15 12l-3-3m0 0l-3 3m3-3v12M5 12a7 7 0 0114 0v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4z" },
    { name: "community", icon: "M3 5a3 3 0 013-3h12a3 3 0 013 3v10a3 3 0 01-3 3H9l-6 3V5z" },
  ];

  useEffect(() => {
    fetch("http://localhost:8000/auth/me", { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setUser)
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    fetch("http://localhost:8000/api/posts")
      .then(res => res.json())
      .then(setPosts)
      .catch((error) => console.error('Error fetching posts:', error))
      .finally(() => setLoadingPosts(false));
  }, []);
  if (loading || !user) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar sections={sections} user={{ name: user.name, image: user.picture }} />
      <div className="flex flex-1 flex-col items-center p-6">
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg flex flex-col items-center">
          {user.picture && (
            <Image
              src={user.picture}
              alt={user.name}
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <p className="text-gray-500 mt-2">{user.email}</p>
          <p className="text-gray-500 text-center mt-4">Welcome to the community!</p>
        </div>

        {user && (
          <div className="w-full max-w-lg mt-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Create a New Post</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);
                const content = formData.get("content") as string;

                if (!content.trim()) {
                  alert("Please enter some content");
                  return;
                }

                let imageUrl: string | undefined = undefined;

                if (selectedImage) {
                  const imageForm = new FormData();
                  imageForm.append("image", selectedImage);

                  try {
                    const uploadRes = await fetch("http://localhost:8000/api/upload", {
                      method: "POST",
                      body: imageForm,
                    });

                    if (!uploadRes.ok) {
                      throw new Error("Failed to upload image");
                    }

                    const uploadJson = await uploadRes.json();
                    imageUrl = uploadJson.imageUrl;
                  } catch (err) {
                    console.error("Image upload failed:", err);
                    alert("Image upload failed");
                    return;
                  }
                }

                try {
                  const response = await fetch("http://localhost:8000/api/posts", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      user_id: user.id,
                      content,
                      image_url: imageUrl,
                    }),
                  });

                  if (!response.ok) {
                    throw new Error("Failed to create post");
                  }

                  const newPost = await response.json();
                  setPosts([newPost, ...posts]);
                  form.reset();
                  setSelectedImage(null);
                  setPreviewUrl(null);
                } catch (error) {
                  console.error("Error creating post:", error);
                }
              }}
              className="space-y-4 mb-8"
            >
              <textarea
                name="content"
                placeholder="What's on your mind?"
                className="w-full border border-gray-300 rounded-lg p-6 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 placeholder:text-base text-gray-900"
                rows={4}
              />

              {/* File input */}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setSelectedImage(file);
                  setPreviewUrl(file ? URL.createObjectURL(file) : null);
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />

              {previewUrl && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Image Preview:</p>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="mt-2 max-h-48 rounded shadow"
                  />
                </div>
              )}

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Post
              </button>
            </form>
          </div>
        )}

        {/* New section: POSTS */}
        <div className="w-full max-w-lg mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
          {loadingPosts ? (
            <p>Loading posts...</p>
          ) : posts.length === 0 ? (
            <p className="text-gray-500">No posts yet.</p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-white p-4 rounded shadow relative">
                  <p className="text-gray-800">{post.content}</p>
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt="Post"
                      className="rounded mt-2"
                    />
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Posted on {new Date(post.created_at).toLocaleString()}
                  </p>

                  {/* ✅ Like button */}
                  {user && (
                    <button
                      className={`mt-2 text-sm font-medium ${
                        post.likedByUser ? 'text-red-600' : 'text-gray-500'
                      }`}
                      onClick={async () => {
                        const method = post.likedByUser ? 'DELETE' : 'POST';
                        const res = await fetch(`http://localhost:8000/api/posts/${post.id}/like`, {
                          method,
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ user_id: user.id }),
                        });

                        if (res.ok) {
                          setPosts(prev =>
                            prev.map(p =>
                              p.id === post.id
                                ? {
                                    ...p,
                                    likedByUser: !post.likedByUser,
                                    likes: post.likes + (post.likedByUser ? -1 : 1),
                                  }
                                : p
                            )
                          );
                        }
                      }}
                    >
                      {post.likedByUser ? '❤️ Unlike' : '🤍 Like'} ({post.likes})
                    </button>
                  )}

                  {/* ✅ Delete button (only for post owner) */}
                  {user?.id === post.user_id && (
                    <button
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition"
                      onClick={async () => {
                        if (!confirm("Are you sure you want to delete this post?")) return;

                        const res = await fetch(`http://localhost:8000/api/posts/${post.id}`, {
                          method: "DELETE",
                        });

                        if (res.ok) {
                          setPosts(prev => prev.filter(p => p.id !== post.id));
                        } else {
                          alert("Failed to delete post");
                        }
                      }}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}