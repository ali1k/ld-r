import React from 'react';

class About extends React.Component {
    render() {
        return (
            <div className="ui page grid" ref="about">
              <div className="ui row">
                <div className="column">
                    <div className="ui segment content">
                        <h2 className="ui header">About</h2>
                        <div>
                            Documentation is available at <a href="http://ld-r.org">http://ld-r.org</a>. <br/>LD-Reactor is developed by:
                            <div className="blue ui card item">
                              <div className="content">
                                <div className="header"><a href="http://vu.nl" target="_blank"><img className="ui centered medium image" src="/assets/img/VU_logo.png" /></a></div>
                                <div className="meta"><a href="http://www.networkinstitute.org/" target="_blank">Department of Computer Science  & <br/> The Network Institute</a></div>
                                <div className="description">
                                    VU University Amsterdam <br/>
                                 de Boelelaan 1081a<br/> 1081HV Amsterdam<br/> The Netherlands <br/>
                                 </div>
                              </div>
                          </div>
                          <div className="ui yellow card item">
                            <div className="content">
                                <div className="extra content">
                                  <h4 className="ui header"> Contacts: </h4>
                                    <div className="ui list">
                                      <div className="item">
                                          tel (+31)-20-598 7731/7718
                                      </div>
                                      <div className="item">
                                        <a className="ui label animated zoomIn" href="mailto:frank.van.harmelen@vu.nl"><i className="mail icon"></i> Prof. &nbsp; Frank van Harmelen &nbsp; &nbsp; &nbsp; &nbsp;</a>
                                      </div>
                                      <div className="item">
                                        <a className="ui label animated zoomIn" href="mailto:a.khalili@vu.nl@vu.nl"><i className="mail icon"></i> Dr. &nbsp; Ali Khalili &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</a>
                                      </div>
                                      <div className="item">
                                        <a className="ui label animated zoomIn" href="mailto:a.loizou@vu.nl"><i className="mail icon"></i> Dr. &nbsp; Antonis Loizou &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</a>
                                      </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </div>
        );
    }
}

export default About;
