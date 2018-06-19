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
                return new Board(elem);
            });
        }

        return this.board_list.findByName(name);
    }
    
    /**
    * Add a member to this team, must be via
    * email rather than by username (weirdly!)
    * @memberof module:TrelloEntities.Team
    * @param email {string} the email of the person to invite
    * @param full_name {string} full name for the person
    * @param type {string} either "admin" or "normal", optional, default normal
    * @example
    * new Trellinator().team("Some Team").addMember("team@theprocedurepeople.com","Cool Folks","admin");
    this.addMember = function(email,full_name,type)
    {
        if(!type)
            type = "normal";

        TrelloApi.put("organizations/"+this.id()+"/members?email="+encodeURIComponent(email)+"&fullName="+encodeURIComponent(full_name)+"&type="+encodeURIComponent(type));
        return this;
    }

    //INTERNAL USE ONLY
    this.load = function()
    {
        this.board_list = null;
        this.data = TrelloApi.get("organizations/"+this.data.id);
        return this;
    }
}
