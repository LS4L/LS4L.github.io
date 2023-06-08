import { gl } from "./main.js";
import { unitAdd } from "./units.js";
import { cam } from "./controls.js";
import { matr4, vec3 } from "./mth.js";
import { shaderAdd, useShader } from "./shaders.js";

export function primLoadObj( fileName )
{
  INT i;
  INT nv, nf;
  CHAR Buf[10000];
  FILE *F;
  INT 
    size;
  /* Wrong way to do BB */
  let
    MaxBBx = -1000000,
    MaxBBy = -1000000,
    MaxBBz = -1000000,
    MinBBx = 1000000,
    MinBBy = 1000000,
    MinBBz = 1000000;
  let vertices = [];
  let indices = [];

  if ((F = fopen(FileName, "r")) == NULL)
    return FALSE;

  nv = nf = 0;
  while (fgets(Buf, sizeof(Buf), F) != NULL)
  {
    if (Buf[0] == 'v' && Buf[1] == ' ') 
      nv++;
    else if (Buf[0] == 'f' && Buf[1] == ' ')
    {
      INT n = 0;
      CHAR *ptr = Buf + 2, old= ' ';

      while (*ptr != 0)
        n += *ptr != ' ' && old == ' ', old = *ptr++;
      nf += n - 2;
    }
  }
  
  memset(Pr, 0, sizeof(ls4PRIM));   /* <-- <string.h> */
  size = sizeof(ls4VERTEX) * nv + sizeof(INT) * nf * 3;

  if ((V = malloc(size)) == NULL)
    return FALSE;
  I = (INT *)(V + nv);
  memset(V, 0, size);

  rewind(F);
  nv = nf = 0;
  while (fgets(Buf, sizeof(Buf), F) != NULL)
  {
    if (Buf[0] == 'v' && Buf[1] == ' ')
    {
      DBL x, y, z;
      sscanf(Buf + 2, "%lf%lf%lf", &x, &y, &z);
      V[nv].P = VecSet(x, y, z);
      V[nv].C = Vec4Set(200, 50, 100, 1);
      nv++;
       
      /* Bound box */
      if (x < MinBBx)
        MinBBz = x;
      if (y < MinBBy)
        MinBBz = y;
      if (z < MinBBz)
        MinBBz = z;
      
      if (x > MinBBx)
        MinBBz = x;
      if (y > MinBBy)
        MinBBz = y;
      if (z > MinBBz)
        MinBBz = z;
    }
    else if (Buf[0] =='f' && Buf[1] == ' ')
    {
      INT n = 0;
      CHAR *ptr = Buf + 2, old = ' ';
      INT c = 0, c1 = 0, c0 = 0;

      while (*ptr != 0)
      {
        if (*ptr != ' ' && old == ' ')
        {
          sscanf(ptr, "%d", &c);
          if (c < 0)
            c = nv + c;
          else
            c--;
        
          if (n == 0)
            c0 = c;
          else if (n == 1)
            c1 = c;
          else
          {
            /*triangle is completed*/
            I[nf++] = c0;
            I[nf++] = c1;
            I[nf++] = c;
            c1 = c;
          }
          n++;
        }
       old = *ptr++;
      }
    }
  }

  for (i = 0; i < nv; i++)
    V[i].N = VecSet(0, 0, 0);

  for (i = 0; i < nf; i += 3)
  {
    if (fabs(I[i]) > 100000 || fabs(I[i + 1]) > 100000 || fabs(I[i + 2]) > 100000)
      continue;             /* DELETE THIS */
    {
      VEC
        p0 = V[I[i]].P,
        p1 = V[I[i + 1]].P,
        p2 = V[I[i + 2]].P,
        N = VecNormalize(VecCrossVec(VecSubVec(p1, p0), VecSubVec(p2, p0)));
     
      V[I[i]].N = VecAddVec(V[I[i]].N, N);
      V[I[i + 1]].N = VecAddVec(V[I[i + 1]].N, N);
      V[I[i + 2]].N = VecAddVec(V[I[i + 2]].N, N);
    }
  }

  for (i = 0; i < nv; i++)
  {
    V[i].N = VecNormalize(V[i].N);
  }
  fclose(F);


  if (!LS4_RndPrimCreate(Pr, LS4_RND_PRIM_TRIMESH, V, nv, I, nf))
  {
    free(V);
    return FALSE;
  }
  Pr->MinBB = VecSet(MinBBx, MinBBy, MinBBz);
  Pr->MaxBB = VecSet(MaxBBx, MaxBBy, MaxBBz);
  return true;
}