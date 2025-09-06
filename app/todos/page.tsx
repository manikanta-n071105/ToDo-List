"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus } from "lucide-react";

interface Todo {
  id: string;
  title: string;
  completed?: boolean;
}

export default function TodosPage() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [token, setToken] = useState<string | null>(null);

  // Load token from localStorage on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("token");
      setToken(t);
      if (!t) router.push("/signin"); // redirect if no token
    }
  }, [router]);

  // Fetch todos for logged-in user
  const fetchTodos = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/auth/todos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok || !data.error) {
        setTodos(data);
      } else {
        setMessage(data.error || "Failed to fetch todos");
      }
    } catch {
      setMessage("Error fetching todos");
    }
  };

  useEffect(() => {
    if (token) fetchTodos();
  }, [token]);

  // Add a new todo
  const handleAdd = async () => {
    if (!title) return setMessage("Title is required");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (res.ok) {
        setTodos((prev) => [...prev, data.todo]);
        setTitle("");
        setMessage("");
      } else {
        setMessage(data.message || data.error);
      }
    } catch {
      setMessage("Error adding todo");
    } finally {
      setLoading(false);
    }
  };

  // Delete a todo
  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch("/api/auth/todos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok) {
        setTodos((prev) => prev.filter((todo) => todo.id !== id));
      } else {
        setMessage(data.message || data.error);
      }
    } catch {
      setMessage("Error deleting todo");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">My Todos</h1>

        {message && <p className="text-sm text-red-600 mb-2">{message}</p>}

        <div className="flex mb-4">
          <input
            type="text"
            placeholder="Add new todo..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleAdd}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-1"
          >
            <Plus size={16} />
            Add
          </button>
        </div>

        <ul>
          {todos.map((todo) => (
            <li key={todo.id} className="flex justify-between items-center border-b py-2">
              <span>{todo.title}</span>
              <button
                onClick={() => handleDelete(todo.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>

        {todos.length === 0 && (
          <p className="text-center text-gray-500 mt-4">No todos yet</p>
        )}
      </div>
    </div>
  );
}
