/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// components/VideoCall.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useDrag } from 'react-use-gesture';
import { cn } from '@/lib/utils';
import { io, Socket } from 'socket.io-client'; // Import Socket type
import { v4 as uuidv4 } from 'uuid';
import Video from './Video';

interface VideoCallProps {
    videoCallPosition: { x: number; y: number };
    setVideoCallPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
    videoCallSize: { width: number; height: number };
    setVideoCallSize: React.Dispatch<React.SetStateAction<{ width: number; height: number }>>;
    containerRef: React.RefObject<HTMLDivElement>;
}

const VideoCall: React.FC<VideoCallProps> = ({
    videoCallPosition,
    setVideoCallPosition,
    videoCallSize,
    containerRef,
}) => {
    const videoCallRef = useRef<HTMLDivElement>(null);
    const [roomId, setRoomId] = useState<string | null>(null);
    const [users, setUsers] = useState<string[]>([]);
    const [connected, setConnected] = useState(false);
    const peers = useRef<{[socketId:string]:RTCPeerConnection}>({});
    const [remoteStreams, setRemoteStreams] = useState<{[socketId:string]:MediaStream}>({});
    const [isJoined, setIsJoined] = useState(false);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [myId, setMyId] = useState<string>('');
    const [showRoomInput, setShowRoomInput] = useState(false)
    const [inputRoomId, setInputRoomId] = useState('')
    const [copied, setCopied] = useState(false);


     useEffect(() => {
        const newSocket = io('http://localhost:3001',{
          path: '/api/socket'
        });
        setSocket(newSocket);
        newSocket.on('connect', () => {
            setMyId(newSocket.id ?? '');
            setConnected(true);
            console.log("Socket connected:", newSocket.id);
        });

        newSocket.on('disconnect',()=>{
            setConnected(false);
            console.log("Socket disconnected:", newSocket.id);
              cleanup();
        })


        return () => {
            newSocket.disconnect();
            cleanup()
        };
    }, []);

   useEffect(() => {
        if (socket && roomId && !isJoined) {
             console.log("joining the room", roomId);
            handleJoinRoom();
        }
    }, [socket, roomId,isJoined]);


   const handleJoinRoom = async () => {
        if(!socket || !roomId) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            })
            setLocalStream(stream);
            socket.emit('join-room', roomId);
             console.log("Emitting 'join-room' with roomId:", roomId);
            setIsJoined(true);

            socket.on('get-users', (users: string[]) => {
                 console.log('Received get-users:', users);
                 setUsers(users);
                users.forEach(user => {
                    if (user !== socket.id) createPeerConnection(user);
                });
            });

             socket.on('user-joined', (socketId: string) => {
                console.log('Received user-joined:', socketId);
                 setUsers((prev) => [...prev, socketId]);
                createPeerConnection(socketId);
            });

             socket.on('user-left',(socketId:string)=>{
                console.log('Received user-left:', socketId);
                setUsers((prev) => prev.filter((user)=>user !== socketId));
                cleanupPeer(socketId);
            })

            } catch (err) {
            console.error('Failed to get user media', err);
        }
       console.log("Room ID",localStream, remoteStreams)
    };

    const handleCreateRoom = () => {
      const newRoomId = uuidv4();
      setRoomId(newRoomId);
       console.log("Created room with ID:", newRoomId);
    };

    const handleJoinExistingRoom = () => {
        setRoomId(inputRoomId)
        setShowRoomInput(false);
    };

   const handleLeaveRoom = () => {
        if(socket){
            socket.emit('leave-room',roomId);
            cleanup();
        }
    };

     const cleanup = ()=>{
            setIsJoined(false);
             setRoomId(null);
             setLocalStream(null);
             setUsers([]);
             setRemoteStreams({});
            Object.values(peers.current).forEach(peer =>{
                 peer.close()
              })
              peers.current = {};
     }

     const cleanupPeer = (socketId:string) =>{
             if(peers.current[socketId]){
                  peers.current[socketId].close();
                 delete peers.current[socketId];
                 setRemoteStreams((prev)=>{
                    const newRemoteStreams = {...prev}
                    delete newRemoteStreams[socketId]
                    return newRemoteStreams
                 })
             }
    }

    const createPeerConnection = async (socketId: string)=>{
        console.log('Create peer connection with socketId: ' + socketId);
        const peer = new RTCPeerConnection();
        peers.current[socketId] = peer;
         if(localStream){
             localStream.getTracks().forEach(track => peer.addTrack(track, localStream));
         }

        peer.ontrack = (event) => {
             setRemoteStreams((prev)=>{
                 console.log("Received remote stream for:", socketId);
                  return {
                      ...prev,
                      [socketId]:event.streams[0]
                  }
              })
        };

        peer.onicecandidate = (event) => {
            if(event.candidate){
                console.log("Sending ICE candidate to " + socketId, event.candidate);
                socket?.emit('ice-candidate', event.candidate, socketId);
            }
        }

        peer.onconnectionstatechange=()=>{
           console.log('Connection state change '+ socketId + " to " + peer.connectionState);
           if(peer.connectionState === 'disconnected'){
              console.log('Disconnected ' + socketId);
              cleanupPeer(socketId)
           }
        }


        try{
          const offer = await peer.createOffer();
          await peer.setLocalDescription(offer);
           console.log('Created and set local offer for:', socketId, offer);
          socket?.emit('offer', offer, socketId);
       }catch(error){
           console.log('error create offer '+ error)
       }

        socket?.on('offer', async (offer:RTCSessionDescriptionInit, senderId:string) => {
            console.log('Received offer from ' + senderId, offer);
            try{
                await peer.setRemoteDescription(new RTCSessionDescription(offer))
               console.log('Set remote description for: ', senderId, offer);
                const answer = await peer.createAnswer();
                await peer.setLocalDescription(answer);
                console.log('Created and set local answer for:', senderId, answer);
                socket?.emit('answer', answer, senderId);
            }catch(error){
                console.log('error handling offer ' + error)
            }
        });


        socket?.on('answer', async(answer: RTCSessionDescriptionInit, senderId: string)=>{
             console.log('Received answer from ' + senderId, answer);
                try{
                    await peer.setRemoteDescription(new RTCSessionDescription(answer));
                      console.log('Set remote description for: ', senderId, answer);
                }catch(error){
                    console.log('error handling answer' + error)
                }
            })

        socket?.on('ice-candidate', async(candidate: RTCIceCandidateInit, senderId:string)=>{
            console.log('Received ICE candidate from ' + senderId, candidate);
            try {
                await peer.addIceCandidate(new RTCIceCandidate(candidate))
                   console.log('Add ice candidate for: ' + senderId, candidate);
            } catch(error){
                console.log('error handling candidate ' + error)
            }
        })
    }

    const handleCopyRoomId = () => {
      if(roomId){
          navigator.clipboard.writeText(roomId);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      }
   }

    const bind = useDrag(({ offset: [x, y] }) => {
        if (!videoCallRef.current || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const boxRect = videoCallRef.current.getBoundingClientRect();

        const maxX = containerRect.width - boxRect.width;
        const maxY = containerRect.height - boxRect.height;

         setVideoCallPosition({
             x: Math.max(0, Math.min(x, maxX)),
             y: Math.max(0, Math.min(y, maxY)),
         });
    });

    return (
        <div
            {...bind()}
            ref={videoCallRef}
            style={{
                left: videoCallPosition.x,
                top: videoCallPosition.y,
                width: videoCallSize.width,
                height: videoCallSize.height,
            }}
                className={cn(
                        "absolute bg-[#36393f] border border-[#202225] rounded-md shadow-lg  overflow-hidden cursor-move flex flex-col items-center justify-center p-4",
                        "sm:p-6",
                        "sm:min-w-[200px] sm:min-h-[150px]",
                        "md:min-w-[250px] md:min-h-[180px]",
                        "lg:min-w-[300px] lg:min-h-[200px]"
                    )}
                >
                    {connected && (
                          <>
                              {
                                isJoined && localStream ?
                                      <div style={{display:'flex', flexDirection:'row'}}>
                                          <Video stream={localStream} myId={myId} isLocal={true} />
                                         {Object.entries(remoteStreams).map(([key, value]) => (
                                                <Video key={key} stream={value} myId={key} />
                                          ))}
                                      </div>
                                       :
                                       !showRoomInput &&(
                                                <div className='flex flex-col items-center gap-4'>
                                                      <div className="flex items-center justify-center w-24 h-24 bg-gray-700 rounded-full border-4 border-gray-500">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={2}
                                                                stroke="currentColor"
                                                                className="w-16 h-16 text-gray-300"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M5.121 17.804A7 7 0 0112 10a7 7 0 016.879 7.804M12 10a4 4 0 100-8 4 4 0 000 8z"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <div className='flex gap-2'>
                                                            <button onClick={handleCreateRoom} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>Create Room</button>
                                                          <button onClick={()=> setShowRoomInput(true)}  className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded'>Join Room</button>
                                                        </div>
                                                    </div>
                                          )
                                      }
                            {isJoined && (
                                  <div className="mt-4 text-white">
                                        Users in room: {users.length}
                                        {roomId && (
                                            <div className='flex items-center gap-2'>
                                                <p>Room ID: {roomId}</p>
                                                  <button onClick={handleCopyRoomId} className='bg-gray-600 hover:bg-gray-800 rounded px-2 py-1 text-sm'>
                                                       {copied ? "Copied!": "Copy"}
                                                  </button>
                                            </div>
                                          )}
                                  <button onClick={handleLeaveRoom} className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Leave Room</button>

                                  </div>
                            )}
                             {!isJoined && showRoomInput && (
                            <div className='flex flex-col items-center gap-4'>
                                  <input
                                      type="text"
                                      placeholder="Enter room ID"
                                      value={inputRoomId}
                                      onChange={(e) => setInputRoomId(e.target.value)}
                                      className='p-2 rounded text-black'
                                  />
                                <div className='flex gap-2'>
                                  <button onClick={handleJoinExistingRoom}  className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded'>Join Room</button>
                                      <button onClick={() => setShowRoomInput(false)} className='bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded'>Cancel</button>
                                </div>
                            </div>
                            )}
                         </>
                    )}
            </div>
    );
}
export default VideoCall;