import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

interface Props {
  titulo: string;
  centro: string;
  ideleccion: string | number;
  hayCandidatos: boolean;
}

export const VotacionCard = ({ titulo, centro, ideleccion, hayCandidatos }: Props) => {
  const navigate = useNavigate();
  return (
    <Card className="h-100 border-success border-1 ">
      <Card.Body>
        <Card.Title className="fw-bold">{titulo}</Card.Title>
        <Card.Text>{centro}</Card.Text>
        {hayCandidatos ? (
          <Button
            className="btn-gradient"
            onClick={() => {
              navigate(`/seleccion/${ideleccion}`);
            }}
          >
            Participar
          </Button>
        ) : (
          <p className="fw-semibold text-muted mb-0">No hay candidatos para tu jornada!</p>
        )}
      </Card.Body>
    </Card>
  );
};
