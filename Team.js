/**
* @class Team
* @memberof module:TrelloEntities
* @param data (Object} key/value pairs of 
* information, must at least contain "id",
* can basically just pass in response from Trello API
* @constructor
* @classdesc The Team class represents
* a Team in Trello. 
* 
* You will mostly deal with this as a return value
* from Member and Trellinator.
*
* @example
* new Trellinator().team("New Or Existing Team");
*/
var Team = function(data)
{    
    this.data       = data;
    this.board_list = null;
    this.member_list = null;

    /**
    * Return the id of this Team
    * @memberof module:TrelloEntities.Team
    * @example
    * new Trellinator().team("New Or Existing Team").id();
    */
    this.id = function()
    {
        return this.data.id;
    }
  
    /**
    * Return the name of this team
    * @memberof module:TrelloEntities.Team
    * @example
    * new Trellinator().team("Name").name();
    */
    this.name = function()
    {
        if(!this.data.displayName)
            this.load();

        return this.data.displayName;
    }

    /**
    * Return a board that is in this team
    * filtered by name or regex, if more than
    * one board matches the first will be returned
    * @memberof module:TrelloEntities.Team
    * @param name {string|RegExp} the string or regex to match
    * against the board names
    * @example
    * new Trellinator().team("My Team").boards().each(function(board)
    * {
    *     board.list("ToDo").cards().first().postComment("Me first!");
    * });
    */
    this.board = function(name)
    {
        return this.boards(name).first();
    }
    
    /**
    * Remove this board
    * @memberof module:TrelloEntities.Team
    * @example
    * new Trellinator().team("My Team").del();
    */
    this.del = function()
    {
      TrelloApi.del("organizations/"+this.id());
      return this;
    }

    /**
    * Return an IterableCollection of boards that are 
    * in this team, filtered by string/regex
    * @memberof module:TrelloEntities.Team
    * @param name {string|RegExp} a string or regex to match
    * against board names
    * @example
    * new Trellinator().team("My Team").boards();
    */
    this.boards = function(name)
    {
        if(!this.board_list)
        {
            this.board_list= new IterableCollection(TrelloApi.get("organizations/"+this.data.id+"/boards?filter=open&fields=all")).transform(function(elem)
            {
                return new Board(elem).setContainingTeam(this);
            });
        }

        return this.board_list.findByName(name);
    }
    
    /**
    * Add a member to this team 
    * @memberof module:TrelloEntities.Team
    * @param member {string} an object of type Member
    * @param type {string} either "admin" or "normal", optional, default normal
    * @example
    * new Trellinator().team("Some Team").addMember("iaindooley","admin");
    */
    this.addMember = function(member,type)
    {
        if(!type)
            type = "normal";

        TrelloApi.put("organizations/"+this.id()+"/members/"+member.id()+"?type="+encodeURIComponent(type));
        this.member_list = null;
        return this;
    }

    /**
    * Add a member to this team by email
    * @memberof module:TrelloEntities.Team
    * @param email {string} the email of the person to invite
    * @param full_name {string} full name for the person
    * @param type {string} either "admin" or "normal", optional, default normal
    * @example
    * new Trellinator().team("Some Team").addMember("team@theprocedurepeople.com","Cool Folks","admin");
    */
    this.addMemberByEmail = function(email,full_name,type)
    {
        if(!type)
            type = "normal";

        TrelloApi.put("organizations/"+this.id()+"/members?email="+encodeURIComponent(email)+"&fullName="+encodeURIComponent(full_name)+"&type="+encodeURIComponent(type));
        this.member_list = null;
        return this;
    }

    /**
    * Return an IterableCollection of Member objects
    * @memberof module:TrelloEntities.Team
    * @example
    * new Trellinator().team("Some Team").members().each(function(member)
    * {
    *     console.log(member.name());
    * });
    */
    this.members = function()
    {
        if(!this.member_list)
        {
            this.member_list = new IterableCollection(TrelloApi.get("organizations/"+this.id()+"/members")).find(function(elem)
            {
                return new Member(elem);
            });
        }

        return this.member_list;
    }

    //INTERNAL USE ONLY
    this.load = function()
    {
        this.board_list = null;
        this.data = TrelloApi.get("organizations/"+this.data.id);
        return this;
    }
}
