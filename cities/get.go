package main

import (
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"

	"database/sql"
	_ "github.com/go-sql-driver/mysql"
	"encoding/json"
)

type Response struct {
	Message string `json:"message"`
}

func Handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	fmt.Println("Received body: ", request.Body)

	db, err := sql.Open("mysql", "cities:Ljk*)y89@tcp(database.mysql:3306)/cities")
	fmt.Println(err)
	var city City
	row := db.QueryRow("select `id`, `name`, `state_id`, `population` from `cities` where LOWER(`name`)=?", "los angeles")
	err2 := row.Scan(&city.ID, &city.Name, &city.StateId, &city.Population)
	switch err2 {
		case sql.ErrNoRows:
			fmt.Println("No cities were found!")
			return events.APIGatewayProxyResponse{Body: "City not found", StatusCode: 404}, nil
		case nil:
			fmt.Println(city)
		default:
			panic(err2)
	}
	defer db.Close()

	cityJson, err := json.Marshal(city)
	return events.APIGatewayProxyResponse{Body: string(cityJson), StatusCode: 200}, nil

}

func main() {
	lambda.Start(Handler)
}

type City struct {
	ID 			int
	Name 		string
	StateId		int
	Population	int
}