"use client";
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Timer } from "lucide-react";
import { useDrag } from "react-use-gesture";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from 'react-toastify';
interface TodoItem {
    id: string;
    text: string;
    completed: boolean;
    estimatedTime?: number;
    startTime?: number;
    timeElapsed?: number;
}

interface Position {
    x: number;
    y: number;
}

interface Props {
    todoPosition: Position;
    setTodoPosition: (position: Position) => void;
    containerRef: React.RefObject<HTMLDivElement>;
}

const TodoList: React.FC<Props> = ({
    todoPosition,
    setTodoPosition,
    containerRef,
}) => {
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [newTodo, setNewTodo] = useState("");
    const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
    const [activeTimerId, setActiveTimerId] = useState<string | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const todoListRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const storedTodos = localStorage.getItem("todos");
        if (storedTodos) {
            setTodos(JSON.parse(storedTodos));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("todos", JSON.stringify(todos));
    }, [todos]);

    useEffect(() => {
        if (activeTimerId) {
            const currentTodo = todos.find((todo) => todo.id === activeTimerId);

            if (currentTodo && currentTodo.startTime && !currentTodo.completed) {
                intervalRef.current = setInterval(() => {
                    setTodos((prevTodos) => {
                        return prevTodos.map((todo) => {
                            if (todo.id === activeTimerId && currentTodo.startTime) {
                                const timeElapsed = Date.now() - currentTodo.startTime;
                                return {
                                    ...todo,
                                    timeElapsed: Math.floor(timeElapsed / 1000),
                                };
                            }
                            return todo;
                        });
                    });
                }, 1000);
            }
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [todos, activeTimerId]);

    const addTodo = () => {
        if (newTodo.trim() === "") return;
        const newTodoItem: TodoItem = {
            id: Date.now().toString(),
            text: newTodo,
            completed: false,
        };
        setTodos([...todos, newTodoItem]);
        toast(
              "New task was added to the list"
            )
        setNewTodo("");
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };
    const handleTaskComplete = (id: string) => {
        setTodos((prevTodos) =>
            prevTodos.map((todo) =>
                todo.id === id ? { ...todo, completed: true } : todo
            )
        );
          toast(
               "Task completed!",
            )
        setExpandedItemId(null);
        setActiveTimerId(null);
    };
    const handleRemoveTodo = (id: string) => {
        setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
          toast(
             "Task Removed!",
           );
        if (expandedItemId === id) {
            setExpandedItemId(null);
            setActiveTimerId(null);
        }
    };

    const handleTimeChange = (
        id: string,
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newTime = parseInt(event.target.value);
        setTodos((prevTodos) =>
            prevTodos.map((todo) =>
                todo.id === id
                    ? { ...todo, estimatedTime: isNaN(newTime) ? undefined : newTime }
                    : todo
            )
        );
    };
    const handleAccordionChange = (id: string) => {
        if (expandedItemId === id) {
            setExpandedItemId(null);
            setActiveTimerId(null);
        } else {
            setExpandedItemId(id);
            setActiveTimerId(id);
            setTodos((prevTodos) => {
                return prevTodos.map((todo) => {
                    if (todo.id === id) {
                        return { ...todo, startTime: Date.now() };
                    }
                    return todo;
                });
            });
        }
    };

    const calculateRemainingTime = (
        estimatedTime: number | undefined,
        timeElapsed: number | undefined
    ) => {
        if (!estimatedTime || !timeElapsed) return null;
        const remainingSeconds = estimatedTime * 60 - timeElapsed;
        if (remainingSeconds <= 0) return "Done";
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const bind = useDrag(({ offset: [x, y] }) => {
        if (!todoListRef.current || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const boxRect = todoListRef.current.getBoundingClientRect();

        const maxX = containerRect.width - boxRect.width;
        const maxY = containerRect.height - boxRect.height;

        setTodoPosition({
            x: Math.max(0, Math.min(x, maxX)),
            y: Math.max(0, Math.min(y, maxY)),
        });
    });

    return (
        <div
            ref={todoListRef}
            className="absolute bg-white p-4 rounded-lg shadow-md w-80 dark:bg-gray-800"
            style={{
                transform: `translate(${todoPosition.x}px, ${todoPosition.y}px)`,
                cursor: "pointer",
            }}
            {...bind()}
        >
            <h2 className="text-lg font-semibold mb-4 dark:text-gray-100">
                Task List
            </h2>
            <div className="flex gap-2 mb-4">
                <Input
                    type="text"
                    placeholder="Add a new task"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            addTodo();
                        }
                    }}
                    ref={inputRef}
                />
                <Button onClick={addTodo}>Add</Button>
            </div>
            <ScrollArea className="max-h-[300px]">
                <Accordion type="single" collapsible>
                    {todos
                        .filter((todo) => !todo.completed)
                        .map((todo) => (
                            <AccordionItem value={todo.id} key={todo.id}>
                                <AccordionTrigger
                                    className="flex items-center justify-between py-2 group hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
                                    onClick={() => handleAccordionChange(todo.id)}
                                >
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={cn(
                                                "dark:text-gray-100",
                                                todo.completed
                                                    ? "line-through text-gray-500 dark:text-gray-400"
                                                    : undefined
                                            )}
                                        >
                                            {todo.text}
                                        </span>
                                    </div>

                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleTaskComplete(todo.id);
                                        }}
                                    >
                                        Done
                                    </Button>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex gap-2 items-center">
                                            <Timer className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            <Input
                                                type="number"
                                                placeholder="Est. time (mins)"
                                                className="w-24 text-sm"
                                                value={
                                                    todo.estimatedTime === undefined
                                                        ? ""
                                                        : todo.estimatedTime.toString()
                                                }
                                                onChange={(e) =>
                                                    handleTimeChange(todo.id, e)
                                                }
                                                disabled={todo.completed}
                                            />
                                            <span>
                                                {calculateRemainingTime(
                                                    todo.estimatedTime,
                                                    todo.timeElapsed
                                                )}
                                            </span>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveTodo(todo.id);
                                            }}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                </Accordion>
            </ScrollArea>
            {todos.some((todo) => todo.completed) && (
                <div className="mt-4">
                    <h3 className="text-md font-semibold mb-2 dark:text-gray-100">
                        Completed Tasks
                    </h3>
                     <ScrollArea className="max-h-[200px]">
                        <ul className="list-none pl-0">
                            {todos
                                .filter((todo) => todo.completed)
                                .map((todo) => (
                                    <li
                                        key={todo.id}
                                        className="flex items-center justify-between py-2 group hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
                                    >
                                        <span className="line-through text-gray-500 dark:text-gray-400">
                                            {todo.text}
                                        </span>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveTodo(todo.id);
                                            }}
                                        >
                                            Remove
                                        </Button>
                                    </li>
                                ))}
                        </ul>
                    </ScrollArea>
                </div>
            )}
        </div>
    );
};

export default TodoList;