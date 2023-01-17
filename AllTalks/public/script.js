     const socket = io('/'); //importing sockets.io
     const videoGrid=document.getElementById('video-grid');
     const myVideo=document.createElement('video');
     myVideo.setAttribute("id",'video');
     myVideo.muted=true;

     let r = document.getElementById('rest');
     let x = document.getElementById('sub');
     let userName;
     /*let's create a new peer connection */
     var peer = new Peer(undefined, {
     path: '/peerjs', 
     host: '/',
     port: '8080'
     });
     /*promise */
     let myVideoStream;
     navigator.mediaDevices.getUserMedia({
       video:true,
       audio:true,
     }).then((stream) => {
      myVideoStream=stream;
      addVideoStream(myVideo,stream);

     peer.on('call', (call) => {
        call.answer(stream)
        const video = document.createElement('video')
        video.setAttribute("id",'video');
        call.on('stream', userVideoStream => {
             addVideoStream(video, userVideoStream)
        })
     })
     
     socket.on('user-connected',(userId) => {
        console.log('TESTING');
        connecToNewUser(userId, stream);
     })
     
     socket.on('user-disconnected',(name) => {
        disconnecToNewUser(name, stream);
     })
     
 
     /*chat-box */
     let text = $('input');

     $('html').keydown((e) =>{
      if(e.which == 13 && text.val().length !== 0){
          socket.emit('message', text.val());
          text.val('')
      }
     });
     
     socket.on('createMessage',(obj) => {
        $('.messages').append(`<li class="message"><b>${obj.name}</b><br/>${obj.message}</li>`);
        scrollToBottom()
      });
      socket.on('createvoice', message => {
        console.log('reaching here')
     let xc = document.getElementById('subs');
     console.log('c tga',xc)

        xc.innerHTML=message;
      });

     /*sub-title display*/
     
     
    })
    
        

peer.on('open', id =>{
    console.log("PEER ID:",id);
    console.log("NAME IS:",NAME);
   socket.emit('join-room',ROOM_ID,NAME,id);
})
/* hey I have joined the room
socket.emit('join-room',ROOM_ID);
*/

const connecToNewUser = (userId, stream) => {
    console.log("TESTING 123");
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    });
    call.on('close', () =>{
        video.remove()
    })
}

const disconnecToNewUser = (userId, close) => {
    const call = peer.call(userId, close)
    const video = document.createElement('video')
    call.on('close', () =>{
        video.remove()
    })
}

const addVideoStream=(video,stream) => {
    video.srcObject=stream;
    video.addEventListener('loadedmetadata',() => {
        video.play();
    })
    videoGrid.append(`${NAME}`);
    videoGrid.append(video);
    
}


/*for scrolling the chat */
  const scrollToBottom = () =>{
      let d = $('.main__chat_window');
      d.scrollTop(d.prop("scrollHeight"));
  }

  /*mute the video */
  const muteUnmute = () => {
      const enabled = myVideoStream.getAudioTracks()[0].enabled;
      if(enabled){
          myVideoStream.getAudioTracks()[0].enabled = false;
          setUnmuteButton();
      }
      else{
          setMuteButton();
          myVideoStream.getAudioTracks()[0].enabled = true;
      }
  }

  const setMuteButton = () => {
      const html = `<i class="fas fa-microphone"></i>
      <span>Mute</span>`
      document.querySelector('.main__mute_button').innerHTML = html;
  }

  const setUnmuteButton = () => {
    const html = `<i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>`
    document.querySelector('.main__mute_button').innerHTML = html;
  }

  /*stop the video */
  const playStop = () => {
      let enabled = myVideoStream.getVideoTracks()[0].enabled;
      if(enabled){
          myVideoStream.getVideoTracks()[0].enabled = false;
          var videoEl=document.getElementById('video');
          console.log("hellllooo");
          console.log("VEDIO :",videoEl.srcObject);
          myVideoStream=videoEl.srcObject;
          tracks=myVideoStream.getTracks();
          tracks.forEach(function(track){
            track.stop();
          });
          console.log("VEDIO 1:",videoEl.srcObject);
         // videoEl.srcObject=null;
          console.log("VEDIO 2:",videoEl.srcObject);
          setPlayVideo()
      }
      else{
          setStopVideo()
          /*
          var videoEl=document.getElementById('video');
          console.log("VEDIO 3:",videoEl.srcObject);
          myVideoStream=videoEl.srcObject;
          tracks=myVideoStream.getTracks();
          tracks.forEach(function(track){
            track.start();
          });
          */navigator.mediaDevices.getUserMedia({
       video:true,
       audio:true,
     }).then((stream) => {
      myVideoStream=stream;
      addVideoStream(myVideo,stream);

     peer.on('call', (call) => {
        call.answer(stream)
        const video = document.createElement('video')
        video.setAttribute("id",'video');
        call.on('stream', userVideoStream => {
             addVideoStream(video, userVideoStream)
        })
     })
          //myVideoStream.getVideoTracks()[0].start();
          //console.log("VEDIO 4:",videoEl.srcObject);
      })
  }
}

  const setStopVideo = () => {
      const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>`
      document.querySelector('.main__video_button').innerHTML = html;
  }

  const setPlayVideo = () => {
   const html = `
   <i class="stop fas fa-video-slash"></i>
   <span>Play Video</span>`
   document.querySelector('.main__video_button').innerHTML =html;
  }
/* subTitles*/



let fal=" ";
   
		function startConverting () {

		if('webkitSpeechRecognition' in window) {
			var speechRecognizer = new webkitSpeechRecognition();
			speechRecognizer.continuous = true;
			speechRecognizer.interimResults = true;
			speechRecognizer.lang = 'en-US';
			speechRecognizer.start();

			var finalTranscripts = '';

			speechRecognizer.onresult = function(event) {
				var interimTranscripts = '';
				for(var i = event.resultIndex; i < event.results.length; i++){
					var transcript = event.results[i][0].transcript;
					transcript.replace("\n", "<br>");
					if(event.results[i].isFinal) {
						finalTranscripts += transcript;
					}else{
						interimTranscripts += transcript;
					}
				}
                r.innerHTML = finalTranscripts + '<span style="color: #999">' + interimTranscripts + '</span>';
                fal=r.innerHTML;
                socket.emit('voicemessage', fal);

                console.log(fal);
              
                
            };
			speechRecognizer.onerror = function (event) {

			};
		}else {
			result.innerHTML = 'Your browser is not supported. Please download Google chrome or Update your Google chrome!!';
		}	
		}

        
       /*invite */
        const cancel = () => { // Hide our invite modalwhen we click cancel
            $("#getCodeModal").modal("hide");
        };
        
        const copy = async() => { // copy our Invitation link when we press the copy button
            const roomid = document.getElementById("roomId").innerText;
            await navigator.clipboard.writeText(roomid);
            /*await navigator.clipboard.writeText("http://localhost:8080/" + roomid); */
        };
        const invitebox = () => { // SHow our model when we click
            $("#getCodeModal").modal("show");
        };
        

        const endCall = (userId) =>{
            socket.emit('disconnect',userId);
        }