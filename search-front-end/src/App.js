import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import FormControl from 'react-bootstrap/FormControl';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import './App.css';

class BookSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      loading:false,
      noResults:false,
      executionTime:null,
      currentPage:1,
      totalPages:0,
      pageStart: 0,
      pageEnd:5,
      searchResults:[]
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleNextPageChange = this.handleNextPageChange.bind(this);
    this.handlePreviousPageChange = this.handlePreviousPageChange.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleNextPageChange(event) {
      event.preventDefault();
      this.setState({currentPage: this.state.currentPage+1});
      this.setState({pageStart: this.state.pageStart+5});
      this.setState({pageEnd: this.state.pageEnd+5});

  }


  handlePreviousPageChange(event) {
      event.preventDefault();
      this.setState({currentPage: this.state.currentPage-1});
      this.setState({pageStart: this.state.pageStart-5});
      this.setState({pageEnd: this.state.pageEnd-5});

  }

  async handleSubmit(event) {
    event.preventDefault();
    this.setState({loading:true})
    const resp = await fetch('http://localhost:5000/search?query='+this.state.value);
    const data = await resp.json();
    this.setState({searchResults:data.data});
    if ( data.data.length > 0 ) {
      console.log("executionTime", data.execution_time);
      this.setState({totalPages:Math.ceil(data.data.length/5)});
      this.setState({executionTime:data.execution_time});
      this.setState({loading:false});
      this.setState({noResults:false});
    }
    else {
      
      this.setState({noResults:true});
      this.setState({loading:false});

    }
    
  }

  showReulstKeyword(result) {
      
      let found = result.found_keyword.map(kw => {
             
             return <span> <small> {kw} </small> </span>

      })

      let notFound = result.not_found_keyword.map(kw => {
             
             return <span className='not-found'> <small> {kw} </small> </span>

      })

      return <div className='keyword'> {found} {notFound} </div>

  }


  render() {

    return (
      <Container fluid>
      <Navbar bg="light" expand="lg">
          <Navbar.Brand href="#home">Search Books</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
           
           
          </Navbar.Collapse>
        </Navbar>
      <Row className="justify-content-md-center search-bar">
          <Col md="4">
       
           <Form inline onSubmit={this.handleSubmit} className="align-items-center">
                  <FormControl type="text" placeholder="Search" className="mr-sm-3 txt-inpt"  value={this.state.value} onChange={this.handleChange} />
                  <Button onClick={this.handleSubmit} className="btn" variant="outline-success">Search</Button>
            </Form>
       
         </Col>

      </Row>

      <Row>
      <Col>
        <div className='searchResults'> 

           {this.state.loading? <p> Loading Results...</p>:null}
           
           {this.state.searchResults.length > 0 && !this.state.loading?
            <div> <div className="ttl-results">Total Results: {this.state.searchResults.length}</div><div className="ttl-results">Execution Time: {this.state.executionTime.toFixed(3)} Seconds</div> </div>:null}

           {this.state.searchResults.length > 0 && !this.state.loading?

           this.state.searchResults.slice(this.state.pageStart,this.state.pageEnd).map((book, index) => (
              <div className="list-item">
              <ListGroup>
              <ListGroup.Item>  <p  key={book.title}>  {book.title}    </p>
                      <small> Score: {book.score} </small>
                     { this.showReulstKeyword(book) } </ListGroup.Item>
              </ListGroup>
              </div>
           )):null}


         
          {this.state.noResults?<p> No results for given keywords </p>:null}



        </div>
        </Col>
       </Row> 
       <Row className="justify-content-md-center prev-next"> 
          <Col md='1'> 
             
          <div>

          {this.state.currentPage > 1 && !this.state.loading?  <a href='#' onClick={this.handlePreviousPageChange}> Previous</a> :null}

          {this.state.searchResults.length > 5 && !this.state.loading?  <a href='#' onClick={this.handleNextPageChange}> Next</a> :null}

          

          </div>

          </Col> 

          <Col md='2'> 

            {this.state.searchResults.length > 0? <span> Page {this.state.currentPage} / {this.state.totalPages} </span> :null}

          </Col>
      </Row>
       <Row> <Col> <div className='footer'> Footer content goes here </div> </Col> </Row>
      </Container>
    );
  }
}

export default BookSearch;
