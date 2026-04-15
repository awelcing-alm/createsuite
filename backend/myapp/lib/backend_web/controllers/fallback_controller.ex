defmodule BackendWeb.FallbackController do
  use BackendWeb, :controller

  alias BackendWeb.ResponseJSON

  def call(conn, {:error, :not_found}) do
    conn
    |> put_status(:not_found)
    |> json(ResponseJSON.error("Not found"))
  end

  def call(conn, {:error, %Ecto.Changeset{} = changeset}) do
    conn
    |> put_status(:unprocessable_entity)
    |> json(ResponseJSON.error(format_changeset_errors(changeset)))
  end

  def call(conn, {:error, message}) when is_binary(message) do
    conn
    |> put_status(:unprocessable_entity)
    |> json(ResponseJSON.error(message))
  end

  def call(conn, _result) do
    conn
    |> put_status(:internal_server_error)
    |> json(ResponseJSON.error("Internal server error"))
  end

  defp format_changeset_errors(changeset) do
    changeset
    |> Ecto.Changeset.traverse_errors(fn {message, opts} ->
      Enum.reduce(opts, message, fn {key, value}, acc ->
        safe_value =
          cond do
            is_tuple(value) -> inspect(value)
            is_list(value) -> Enum.join(value, ", ")
            true -> to_string(value)
          end

        String.replace(acc, "%{#{key}}", safe_value)
      end)
    end)
    |> Enum.map_join(", ", fn {field, messages} -> "#{field} #{Enum.join(messages, ", ")}" end)
  end
end
