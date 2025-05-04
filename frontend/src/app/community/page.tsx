'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../stories/Sidebar";
import { User } from "../../types/users";
import Image from "next/image";

interface Comment {
  id: number;
  user_id: number;
  post_id: number;
  content: string;
  created_at: string;
  user: {
    name: string;
    picture?: string;
  };
}

interface Post {
  id: number;
  user_id: number;
  content: string;
  image_url?: string;
  created_at: string;
  likes: number;
  likedByUser?: boolean;
  comments?: Comment[];
}

export default function CommunityPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();

  const sections = [
    { name: "chat", icon: "..." },
    { name: "workouts", icon: "..." },
    { name: "community", icon: "..." },
  ];

  useEffect(() => {
    fetch("http://localhost:8000/auth/me", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setUser)
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    fetch("http://localhost:8000/api/posts", { credentials: "include" })
      .then((res) => res.json())
      .then(async (fetchedPosts: Post[]) => {
        const postsWithComments = await Promise.all(
          fetchedPosts.map(async (post) => {
            const res = await fetch(`http://localhost:8000/api/posts/${post.id}/comments`, {
              credentials: "include",
            });
            const comments = await res.json();
            return { ...post, comments };
          })
        );
        setPosts(postsWithComments);
      })
      .catch((err) => console.error("Error fetching posts:", err))
      .finally(() => setLoadingPosts(false));
  }, []);

  if (loading || !user) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar sections={sections} user={{ name: user.name, image: user.picture }} />

      <div className="flex flex-1 flex-col items-center p-6">
        {/* Welcome Card */}
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

        {/* Create New Post */}
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

                  if (!uploadRes.ok) throw new Error("Failed to upload image");

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
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                  body: JSON.stringify({
                    user_id: user.id,
                    content,
                    image_url: imageUrl,
                  }),
                });

                if (!response.ok) throw new Error("Failed to create post");

                const newPost = await response.json();
                setPosts([{ ...newPost, comments: [] }, ...posts]);
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
              className="w-full border border-gray-300 rounded-lg p-6 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              rows={4}
            />

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
                <img src={previewUrl} alt="Preview" className="mt-2 max-h-48 rounded shadow" />
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

        {/* Recent Posts */}
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
                    <img src={post.image_url} alt="Post" className="rounded mt-2" />
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Posted on {new Date(post.created_at).toLocaleString()}
                  </p>

                  {/* Like Button */}
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
                          credentials: "include",
                          body: JSON.stringify({ user_id: user.id }),
                        });

                        if (res.ok) {
                          setPosts((prev) =>
                            prev.map((p) =>
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

                  {/* Delete Button */}
                  {user?.id === post.user_id && (
                    <button
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition"
                      onClick={async () => {
                        if (!confirm("Are you sure you want to delete this post?")) return;

                        const res = await fetch(`http://localhost:8000/api/posts/${post.id}`, {
                          method: "DELETE",
                        });

                        if (res.ok) {
                          setPosts((prev) => prev.filter((p) => p.id !== post.id));
                        } else {
                          alert("Failed to delete post");
                        }
                      }}
                    >
                      🗑️
                    </button>
                  )}

                  {/* Comments Section */}
                  <div className="mt-4 border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Comments</h3>
                    <ul className="space-y-2 text-sm text-gray-800">
                    {post.comments?.map((c) => (
                      <li key={c.id} className="bg-gray-50 px-3 py-2 rounded flex items-start gap-3">
                        {c.user?.picture && (
                          <Image
                            src={c.user.picture}
                            alt={c.user.name}
                            width={32}
                            height={32}
                            className="rounded-full object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{c.user.name}</p>
                          <p className="text-gray-700">{c.content}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const commentText = commentInputs[post.id]?.trim();
                        if (!commentText) return;

                        const res = await fetch(`http://localhost:8000/api/posts/${post.id}/comments`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          credentials: "include",
                          body: JSON.stringify({ content: commentText }),
                        });

                        if (res.ok) {
                          const newComment = await res.json();
                          setPosts((prev) =>
                            prev.map((p) =>
                              p.id === post.id
                                ? {
                                    ...p,
                                    comments: [newComment, ...(p.comments || [])],
                                  }
                                : p
                            )
                          );
                          setCommentInputs((prev) => ({ ...prev, [post.id]: "" }));
                        }
                      }}
                      className="mt-3 flex items-center gap-2"
                    >
                      <input
                        type="text"
                        name="comment"
                        placeholder="Write a comment..."
                        value={commentInputs[post.id] || ""}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        className="text-sm bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                      >
                        Post
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
