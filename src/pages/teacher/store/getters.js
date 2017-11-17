const getters = {
  userid: state => state.userid,
  avatar: state => state.avatar,
  auth: state => state.auth,
  inviteCode: state => state.inviteCode,
  courseid: state => state.courseid,
  classroomid: state => state.classroomid,
  coursename: state => state.coursename,
  socket: state => state.socket,
  lessonid: state => state.lessonid,
  presentationid: state => state.presentationid,
  current: state => state.current,
  pptData: state => state.pptData,
  newtougao: state => state.newtougao,
  isPPTVersionAboveOne: state => state.isPPTVersionAboveOne,
  
  qrcodeStatus: state => state.qrcodeStatus,
  courseid: state => state.courseid,
  classroomid: state => state.classroomid,
  idIndexMap: state => state.idIndexMap,
};
export default getters
