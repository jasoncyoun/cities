package main

import (
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"

	"database/sql"
	_ "github.com/go-sql-driver/mysql"
	"encoding/json"
	//"os"
)

type Response struct {
	Message string `json:"message"`
}

func Handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	fmt.Println("In States: ", request.Body)

	db, err := sql.Open("mysql", "cities:Ljk*)y89@tcp(database.mysql:3306)/cities")
	fmt.Println(err)
	fmt.Println("connected to MySQL!")

	var states []*State

	rows, err2 := db.Query("select `id`, `name`, `abbr`, `population` from `states` order by `name`")
	if err2 != nil {
		panic(err)
	}
	defer rows.Close()
	for rows.Next() {
		state := new(State)
		if err := rows.Scan(&state.ID, &state.Name, &state.Abbr, &state.Population); err != nil { panic(err.Error()) }
		states = append(states, state)
		fmt.Println(state)
	}
	defer db.Close()

	statesJson, err := json.Marshal(states)
	return events.APIGatewayProxyResponse{Body: string(statesJson), StatusCode: 200}, nil
}

func main() {
	lambda.Start(Handler)
}

type State struct {
	ID 			int `json:"id"`
	Name 		string `json:"name"`
	Abbr		string `json:"abbr"`
	Population	int `json:"population"`
}