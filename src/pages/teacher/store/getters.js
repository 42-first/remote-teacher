const getters = {
  userid: state => state.userid,
  lessonid: state => state.lessonid,
  presentationid: state => state.presentationid,
  current: state => state.current,
  pptData: state => state.pptData,
  newtougao: state => state.newtougao,
  isPPTVersionAboveOne: state => state.isPPTVersionAboveOne,
  socket: state => state.socket,
  idIndexMap: state => state.idIndexMap,
};
export default getters
