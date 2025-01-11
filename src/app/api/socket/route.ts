/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server } from 'socket.io';
import {  NextRequest } from 'next/server'; // Import NextRequest
import { NextResponse } from 'next/server';

const socketServer = {
    io: null as Server | null,
};

export async function GET(req: NextRequest) { 
    if (!socketServer.io) {
        console.log('Initializing new Socket.IO server...');

        const io = new Server({
            path: '/api/socket',
            cors: {
                origin: 'http://localhost:3000',
                methods: ['GET', 'POST'],
            },
             transports: ['websocket'],
        });

        socketServer.io = io;

        io.on('connection', (socket) => {
            console.log(`User connected: ${socket.id}`);

            socket.on('join-room', (roomId) => {
                console.log('User joined room: ' + roomId);
                socket.join(roomId);
                 socket.to(roomId).emit('user-joined', socket.id);
                 io.to(socket.id).emit(
                    'get-users',
                    Array.from(io.sockets.adapter.rooms.get(roomId) || []).filter(id => id !== socket.id)
                );
            });

            socket.on('offer', (offer, to) => {
                socket.to(to).emit('offer', offer, socket.id);
            });

            socket.on('answer', (answer, to) => {
                socket.to(to).emit('answer', answer, socket.id);
            });

             socket.on('ice-candidate', (candidate, to) => {
                socket.to(to).emit('ice-candidate', candidate, socket.id);
            });

            socket.on('leave-room', (roomId)=>{
                 console.log('User leaving room: ' + roomId);
                 socket.leave(roomId);
                 socket.to(roomId).emit('user-left',socket.id);
            })

            socket.on('disconnect', () => {
                console.log('User disconnected: ' + socket.id);
            });
        });

        io.listen(3001);
    }

    return new NextResponse(null, { status: 204 });
}