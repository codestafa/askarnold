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
  user: {
    name: string;
    picture?: string;
  };
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
    { name: 'About', icon: 'M3 9.5L12 3l9 6.5v9.5a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4H9v4a2 2 0 01-2 2H3a2 2 0 01-2-2V9.5z' },
    { name: 'chat', icon: 'M3 5a3 3 0 013-3h12a3 3 0 013 3v10a3 3 0 01-3 3H9l-6 3V5z' },
    { name: 'workouts', icon: 'M15 12l-3-3m0 0l-3 3m3-3v12M5 12a7 7 0 0114 0v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4z' },
    { name: 'community', icon: 'M16 14a4 4 0 10-8 0v2h8v-2zm-4-6a2 2 0 110-4 2 2 0 010 4z' }
  ];

  useEffect(() => {
    fetch("/auth/me", { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setUser)
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    fetch("/api/posts", { credentials: "include" })
      .then((r) => r.json())
      .then(async (fetchedPosts: Post[]) => {
        const withDetails = await Promise.all(
          fetchedPosts.map(async (post) => {
            try {
              const [commentsRes, userRes] = await Promise.all([
                fetch(`/api/posts/${post.id}/comments`, { credentials: "include" }),
                fetch(`/api/user/${post.user_id}`, { credentials: "include" }),
              ]);

              if (!commentsRes.ok || !userRes.ok) throw new Error("Failed fetching details");

              const comments: Comment[] = await commentsRes.json();
              const userData: { name: string; picture?: string } = await userRes.json();

              return { ...post, comments, user: userData };
            } catch (e) {
              console.error("Error enriching post:", post.id, e);
              return post;
            }
          })
        );

        const deduped = Array.from(new Map(withDetails.map(p => [p.id, p])).values());
        setPosts(deduped);
      })
      .catch((err) => console.error("Error fetching posts:", err))
      .finally(() => setLoadingPosts(false));
  }, []);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
      <div className="w-full lg:w-64 flex-shrink-0 bg-white border-r">
        <Sidebar sections={sections} user={{ name: user.name, image: user.picture }} />
      </div>

      <div className="flex flex-col items-center p-6 w-full">
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
          <p className="text-gray-700 mt-2">{user.email}</p>
          <p className="text-gray-700 text-center mt-4">Welcome to the community!</p>
        </div>

        {/* Create Post Form */}
        <div className="w-full max-w-lg mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Create a New Post</h2>
          <form
            className="space-y-4 mb-8"
            onSubmit={async (e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              const content = data.get("content") as string;
              if (!content.trim()) return alert("Please enter some content");

              let imageUrl: string | undefined;
              if (selectedImage) {
                const imgForm = new FormData();
                imgForm.append("image", selectedImage);
                const up = await fetch("/api/upload", { method: "POST", body: imgForm });
                if (!up.ok) return alert("Image upload failed");
                const { imageUrl: url } = await up.json();
                imageUrl = url;
              }

              const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ user_id: user.id, content, image_url: imageUrl }),
              });

              if (!res.ok) return alert("Failed to create post");

              const newPost = await res.json();
              setPosts((prev) => [
                {
                  ...newPost,
                  comments: [],
                  user: { name: user.name, picture: user.picture },
                },
                ...prev,
              ]);

              e.currentTarget.reset();
              setSelectedImage(null);
              setPreviewUrl(null);
            }}
          >
            <textarea
              name="content"
              rows={4}
              placeholder="What's on your mind?"
              className="w-full border border-gray-300 rounded-lg p-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setSelectedImage(file);
                setPreviewUrl(file ? URL.createObjectURL(file) : null);
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {previewUrl && (
              <div className="mt-4">
                <p className="text-gray-700 text-sm">Image Preview:</p>
                <img src={previewUrl} alt="Preview" className="mt-2 max-h-48 rounded shadow" />
              </div>
            )}
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Post
            </button>
          </form>
        </div>

        {/* Post Feed */}
        <div className="w-full max-w-lg mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Recent Posts</h2>
          {loadingPosts ? (
            <p>Loading posts...</p>
          ) : posts.length === 0 ? (
            <p className="text-gray-700">No posts yet.</p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-white p-4 rounded shadow relative">
                  <div className="flex items-center gap-2 mb-2 cursor-pointer" onClick={() => router.push(`/user/${post.user_id}`)}>
                    {post.user.picture && (
                      <Image
                        src={post.user.picture}
                        alt={post.user.name}
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                      />
                    )}
                    <p className="font-semibold hover:underline text-gray-900">{post.user.name}</p>
                  </div>

                  <p className="text-gray-900">{post.content}</p>
                  {post.image_url && <img src={post.image_url} alt="" className="rounded mt-2" />}
                  <p className="text-xs text-gray-500 mt-2">{new Date(post.created_at).toLocaleString()}</p>

                  <button
                    className={`mt-2 text-sm ${post.likedByUser ? "text-red-600" : "text-gray-700"}`}
                    onClick={async () => {
                      const method = post.likedByUser ? "DELETE" : "POST";
                      const r = await fetch(`/api/posts/${post.id}/like`, {
                        method,
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ user_id: user.id }),
                      });
                      if (r.ok)
                        setPosts((ps) =>
                          ps.map((p) =>
                            p.id === post.id
                              ? {
                                  ...p,
                                  likedByUser: !p.likedByUser,
                                  likes: p.likes + (p.likedByUser ? -1 : 1),
                                }
                              : p
                          )
                        );
                    }}
                  >
                    {post.likedByUser ? "❤️ Unlike" : "🤍 Like"} ({post.likes})
                  </button>

                  {user.id === post.user_id && (
                    <button
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
                      onClick={async () => {
                        if (!confirm("Delete this post?")) return;
                        const r = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
                        if (r.ok) setPosts((ps) => ps.filter((p) => p.id !== post.id));
                      }}
                    >
                      🗑️
                    </button>
                  )}

                  {/* Comments */}
                  <div className="mt-4 border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">Comments</h3>
                    <ul className="space-y-2">
                      {post.comments?.map((c) => (
                        <li key={c.id} className="flex items-start gap-3 bg-gray-50 px-3 py-2 rounded">
                          <div className="cursor-pointer" onClick={() => router.push(`/user/${c.user_id}`)}>
                            {c.user.picture ? (
                              <Image src={c.user.picture} alt={c.user.name} width={32} height={32} className="rounded-full" />
                            ) : (
                              <div className="w-8 h-8 bg-gray-300 rounded-full" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium hover:underline cursor-pointer text-gray-900" onClick={() => router.push(`/user/${c.user_id}`)}>
                              {c.user.name}
                            </p>
                            <p className="text-gray-900">{c.content}</p>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {/* New Comment */}
                    <form
                      className="mt-3 flex items-center gap-2"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const txt = commentInputs[post.id]?.trim();
                        if (!txt) return;

                        const r = await fetch(`/api/posts/${post.id}/comments`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          credentials: "include",
                          body: JSON.stringify({ content: txt }),
                        });

                        if (r.ok) {
                          const newC = await r.json();
                          setPosts((ps) =>
                            ps.map((p) =>
                              p.id === post.id ? { ...p, comments: [newC, ...(p.comments || [])] } : p
                            )
                          );
                          setCommentInputs((ci) => ({ ...ci, [post.id]: "" }));
                        }
                      }}
                    >
                      <input
                        type="text"
                        name="comment"
                        placeholder="Write a comment..."
                        value={commentInputs[post.id] || ""}
                        onChange={(e) => setCommentInputs((ci) => ({ ...ci, [post.id]: e.target.value }))}
                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded">
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
