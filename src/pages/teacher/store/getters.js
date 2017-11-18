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
  total: state => state.total,
  pptData: state => state.pptData,
  newtougao: state => state.newtougao,
  isPPTVersionAboveOne: state => state.isPPTVersionAboveOne,
  
  qrcodeStatus: state => state.qrcodeStatus,
  newdoubt: state => state.newdoubt,
  newtougao: state => state.newtougao,
  idIndexMap: state => state.idIndexMap,
};
export default getters
