import React from 'react'
import PieChart from './PieChart'
import ChannelInfo from './ChannelInfo'
import UserList from './UserList'
import { Row, Col, Well } from 'react-bootstrap'

class PageBody extends React.Component {
  
  render() {
    return (
      <div>
        <Row>
          <Col>
            <PieChart names={this.props.names} numbers={this.props.numbers} />
          </Col>
        </Row>
        <Row>
          <Col>
            <Well>
              <ChannelInfo 
                messages={this.props.messages}
                words={this.props.words}
                users={this.props.numUsers}
                avgLength={this.props.avgLength}
                avgSentiment={this.props.avgSentiment}
              />
            </Well>
          </Col>
        </Row>
        <Row>
          <Col>
            <UserList 
              users={this.props.users} 
              messages={this.props.messages} 
              globalUsers={this.props.globalUsers}
            />
            <p>*Sentiment is a way of measuring the polarity of a messages. A positive sentiment means that the message is positive like "good" or "nice" and vice versa</p>
          </Col>
        </Row>
      </div>
    )
  }
}

  export default PageBody
