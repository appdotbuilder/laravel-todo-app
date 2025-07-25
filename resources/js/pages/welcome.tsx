import React, { useState } from 'react';
import { type SharedData } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Check } from 'lucide-react';

interface Task {
    id: number;
    title: string;
    completed: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    tasks: Task[];
    [key: string]: unknown;
}

export default function Welcome({ tasks }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        router.post(route('tasks.store'), {
            title: newTaskTitle.trim()
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setNewTaskTitle('');
            }
        });
    };

    const handleToggleTask = (task: Task) => {
        router.patch(route('tasks.update', task.id), {
            completed: !task.completed
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleDeleteTask = (task: Task) => {
        router.delete(route('tasks.destroy', task.id), {
            preserveState: true,
            preserveScroll: true
        });
    };

    const completedTasks = tasks.filter(task => task.completed);
    const pendingTasks = tasks.filter(task => !task.completed);

    return (
        <>
            <Head title="TODO App">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <header className="mb-6 w-full max-w-[800px] text-sm">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                <main className="w-full max-w-[800px] flex-1">
                    <div className="rounded-lg bg-white p-8 shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                        <h1 className="mb-8 text-3xl font-bold text-center dark:text-[#EDEDEC]">
                            TODO App
                        </h1>

                        {/* Add Task Form */}
                        <form onSubmit={handleAddTask} className="mb-8">
                            <div className="flex gap-3">
                                <Input
                                    type="text"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    placeholder="Add a new task..."
                                    className="flex-1"
                                />
                                <Button type="submit" disabled={!newTaskTitle.trim()}>
                                    Add Task
                                </Button>
                            </div>
                        </form>

                        {/* Tasks List */}
                        <div className="space-y-6">
                            {/* Pending Tasks */}
                            {pendingTasks.length > 0 && (
                                <div>
                                    <h2 className="mb-4 text-lg font-semibold text-[#706f6c] dark:text-[#A1A09A]">
                                        Pending Tasks ({pendingTasks.length})
                                    </h2>
                                    <div className="space-y-2">
                                        {pendingTasks.map((task) => (
                                            <div
                                                key={task.id}
                                                className="flex items-center gap-3 rounded-md border border-[#19140035] p-3 dark:border-[#3E3E3A]"
                                            >
                                                <button
                                                    onClick={() => handleToggleTask(task)}
                                                    className="flex h-5 w-5 items-center justify-center rounded border-2 border-[#706f6c] hover:border-[#1b1b18] dark:border-[#A1A09A] dark:hover:border-[#EDEDEC]"
                                                >
                                                </button>
                                                <span className="flex-1 text-[#1b1b18] dark:text-[#EDEDEC]">
                                                    {task.title}
                                                </span>
                                                <button
                                                    onClick={() => handleDeleteTask(task)}
                                                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Completed Tasks */}
                            {completedTasks.length > 0 && (
                                <div>
                                    <h2 className="mb-4 text-lg font-semibold text-[#706f6c] dark:text-[#A1A09A]">
                                        Completed Tasks ({completedTasks.length})
                                    </h2>
                                    <div className="space-y-2">
                                        {completedTasks.map((task) => (
                                            <div
                                                key={task.id}
                                                className="flex items-center gap-3 rounded-md border border-[#19140035] p-3 opacity-75 dark:border-[#3E3E3A]"
                                            >
                                                <button
                                                    onClick={() => handleToggleTask(task)}
                                                    className="flex h-5 w-5 items-center justify-center rounded border-2 border-green-500 bg-green-500 text-white hover:border-green-600 hover:bg-green-600"
                                                >
                                                    <Check size={12} />
                                                </button>
                                                <span className="flex-1 text-[#706f6c] line-through dark:text-[#A1A09A]">
                                                    {task.title}
                                                </span>
                                                <button
                                                    onClick={() => handleDeleteTask(task)}
                                                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Empty State */}
                            {tasks.length === 0 && (
                                <div className="py-12 text-center">
                                    <p className="text-lg text-[#706f6c] dark:text-[#A1A09A]">
                                        No tasks yet. Add your first task above!
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        {tasks.length > 0 && (
                            <div className="mt-8 flex justify-center gap-8 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                <span>Total: {tasks.length}</span>
                                <span>Pending: {pendingTasks.length}</span>
                                <span>Completed: {completedTasks.length}</span>
                            </div>
                        )}
                    </div>
                </main>

                <footer className="mt-8 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                    Built with ❤️ by{' '}
                    <a
                        href="https://app.build"
                        target="_blank"
                        className="font-medium text-[#f53003] hover:underline dark:text-[#FF4433]"
                    >
                        app.build
                    </a>
                </footer>
            </div>
        </>
    );
}